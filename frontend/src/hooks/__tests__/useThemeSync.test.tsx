/**
 * Tests for Enhanced Theme Synchronization Hook
 * 
 * Comprehensive test suite to verify theme synchronization works correctly
 * across all modes and components, ensuring robust theme management.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { renderHook, act } from '@testing-library/react';
import { useThemeSync, cleanupThemeStorage, migrateThemeStorage } from '../useThemeSync';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { getDefaultTheme } from '../../themes/professionalThemes';
import React from 'react';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get store() {
      return { ...store };
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

Object.defineProperty(console, 'log', { value: mockConsole.log });
Object.defineProperty(console, 'warn', { value: mockConsole.warn });
Object.defineProperty(console, 'error', { value: mockConsole.error });

// Test wrapper with ThemeProvider
const createWrapper = (initialThemeId?: string) => {
  return ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider initialThemeId={initialThemeId}>
      {children}
    </ThemeProvider>
  );
};

describe('useThemeSync Hook', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should initialize with default theme when no storage exists', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useThemeSync(), { wrapper });

      expect(result.current.themeId).toBe(getDefaultTheme().id);
      expect(result.current.currentTheme.id).toBe(getDefaultTheme().id);
      expect(result.current.isAvailable).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it('should initialize with provided initial theme', () => {
      const initialTheme = 'modern-minimal';
      const wrapper = createWrapper(initialTheme);
      const { result } = renderHook(() => useThemeSync({ initialThemeId: initialTheme }), { wrapper });

      expect(result.current.themeId).toBe(initialTheme);
    });

    it('should set theme correctly', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useThemeSync({ debug: true }), { wrapper });

      act(() => {
        result.current.setTheme('creative-vibrant', 'test');
      });

      expect(result.current.themeId).toBe('creative-vibrant');
    });

    it('should handle invalid theme IDs gracefully', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useThemeSync(), { wrapper });

      act(() => {
        result.current.setTheme('invalid-theme-id');
      });

      expect(result.current.error).toContain('Invalid theme ID');
    });
  });

  describe('Mode-Specific Theme Management', () => {
    it('should handle single mode theme storage', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useThemeSync({ mode: 'single' }), { wrapper });

      act(() => {
        result.current.setThemeForMode('single', 'corporate-blue');
      });

      expect(result.current.getThemeForMode('single')).toBe('corporate-blue');
    });

    it('should handle presentation mode theme storage', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useThemeSync({ mode: 'presentation' }), { wrapper });

      act(() => {
        result.current.setThemeForMode('presentation', 'modern-minimal');
      });

      expect(result.current.getThemeForMode('presentation')).toBe('modern-minimal');
    });

    it('should maintain separate themes for different modes', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useThemeSync(), { wrapper });

      act(() => {
        result.current.setThemeForMode('single', 'corporate-blue');
        result.current.setThemeForMode('presentation', 'creative-vibrant');
      });

      expect(result.current.getThemeForMode('single')).toBe('corporate-blue');
      expect(result.current.getThemeForMode('presentation')).toBe('creative-vibrant');
    });
  });

  describe('Storage Persistence', () => {
    it('should persist theme to localStorage', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useThemeSync({ mode: 'single' }), { wrapper });

      act(() => {
        result.current.setTheme('modern-minimal');
      });

      // Wait for debounced storage
      setTimeout(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'ai-ppt-ai-ppt-selected-theme',
          'modern-minimal'
        );
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'ai-ppt-ai-ppt-single-mode-theme',
          'modern-minimal'
        );
      }, 400);
    });

    it('should load theme from localStorage on initialization', () => {
      mockLocalStorage.setItem('ai-ppt-ai-ppt-selected-theme', 'creative-vibrant');
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => useThemeSync(), { wrapper });

      expect(result.current.themeId).toBe('creative-vibrant');
    });

    it('should prioritize mode-specific storage over general storage', () => {
      mockLocalStorage.setItem('ai-ppt-ai-ppt-selected-theme', 'corporate-blue');
      mockLocalStorage.setItem('ai-ppt-ai-ppt-single-mode-theme', 'modern-minimal');
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => useThemeSync({ mode: 'single' }), { wrapper });

      expect(result.current.themeId).toBe('modern-minimal');
    });
  });

  describe('Theme Reset and Force Sync', () => {
    it('should reset to default theme', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useThemeSync(), { wrapper });

      act(() => {
        result.current.setTheme('creative-vibrant');
      });

      act(() => {
        result.current.resetTheme();
      });

      expect(result.current.themeId).toBe(getDefaultTheme().id);
    });

    it('should force sync theme state', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useThemeSync({ debug: true }), { wrapper });

      act(() => {
        result.current.forceSync();
      });

      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Force sync requested'),
        expect.anything()
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      const originalSetItem = mockLocalStorage.setItem;
      mockLocalStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useThemeSync(), { wrapper });

      act(() => {
        result.current.setTheme('modern-minimal');
      });

      setTimeout(() => {
        expect(result.current.error).toContain('Failed to save theme to storage');
      }, 400);

      // Restore original method
      mockLocalStorage.setItem = originalSetItem;
    });
  });
});

describe('Theme Storage Utilities', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  describe('cleanupThemeStorage', () => {
    it('should remove all conflicting theme storage keys', () => {
      // Set up conflicting keys
      mockLocalStorage.setItem('ai-ppt-theme', 'test1');
      mockLocalStorage.setItem('theme-selection', 'test2');
      mockLocalStorage.setItem('app-theme', 'test3');
      mockLocalStorage.setItem('ai-ppt-selected-theme', 'test4');

      cleanupThemeStorage();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('ai-ppt-theme');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('theme-selection');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('app-theme');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('ai-ppt-selected-theme');
    });

    it('should handle removal errors gracefully', () => {
      mockLocalStorage.removeItem = jest.fn(() => {
        throw new Error('Cannot remove item');
      });

      expect(() => cleanupThemeStorage()).not.toThrow();
      expect(mockConsole.warn).toHaveBeenCalled();
    });
  });

  describe('migrateThemeStorage', () => {
    it('should migrate old theme storage to new format', () => {
      mockLocalStorage.setItem('ai-ppt-theme', 'corporate-blue');

      migrateThemeStorage();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'ai-ppt-ai-ppt-selected-theme',
        'corporate-blue'
      );
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Migrated theme storage'),
        expect.objectContaining({
          oldTheme: 'corporate-blue'
        })
      );
    });

    it('should prioritize newer storage formats during migration', () => {
      mockLocalStorage.setItem('ai-ppt-selected-theme', 'modern-minimal');
      mockLocalStorage.setItem('ai-ppt-theme', 'corporate-blue');

      migrateThemeStorage();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'ai-ppt-ai-ppt-selected-theme',
        'modern-minimal'
      );
    });

    it('should handle migration errors gracefully', () => {
      mockLocalStorage.setItem('ai-ppt-theme', 'test-theme');
      mockLocalStorage.setItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      expect(() => migrateThemeStorage()).not.toThrow();
      expect(mockConsole.warn).toHaveBeenCalledWith(
        'Failed to migrate theme storage:',
        expect.any(Error)
      );
    });
  });
});
