/**
 * Integration Tests for Theme Synchronization
 * 
 * End-to-end tests to verify theme synchronization works correctly
 * across the entire application, including mode switching and
 * component integration.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useThemeSync } from '../hooks/useThemeSync';
import { getDefaultTheme } from '../themes/professionalThemes';

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

// Test component that uses theme synchronization
const TestThemeComponent: React.FC<{ mode: 'single' | 'presentation' }> = ({ mode }) => {
  const themeSync = useThemeSync({ mode, debug: true });

  return (
    <div data-testid="theme-component">
      <div data-testid="current-theme">{themeSync.themeId}</div>
      <div data-testid="sync-status">{themeSync.isSyncing ? 'syncing' : 'idle'}</div>
      <div data-testid="error-status">{themeSync.error || 'no-error'}</div>
      
      <button
        data-testid="set-theme-btn"
        onClick={() => themeSync.setTheme('modern-minimal', 'test')}
      >
        Set Modern Minimal
      </button>
      
      <button
        data-testid="set-creative-btn"
        onClick={() => themeSync.setTheme('creative-vibrant', 'test')}
      >
        Set Creative Vibrant
      </button>
      
      <button
        data-testid="reset-theme-btn"
        onClick={() => themeSync.resetTheme()}
      >
        Reset Theme
      </button>
      
      <button
        data-testid="force-sync-btn"
        onClick={() => themeSync.forceSync()}
      >
        Force Sync
      </button>

      <div data-testid="single-mode-theme">
        {themeSync.getThemeForMode('single')}
      </div>
      
      <div data-testid="presentation-mode-theme">
        {themeSync.getThemeForMode('presentation')}
      </div>
    </div>
  );
};

// Test wrapper with ThemeProvider
const TestWrapper: React.FC<{ children: React.ReactNode; initialTheme?: string }> = ({ 
  children, 
  initialTheme 
}) => (
  <ThemeProvider initialThemeId={initialTheme}>
    {children}
  </ThemeProvider>
);

describe('Theme Synchronization Integration', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  describe('Single Mode Theme Management', () => {
    it('should initialize and manage themes in single mode', async () => {
      render(
        <TestWrapper>
          <TestThemeComponent mode="single" />
        </TestWrapper>
      );

      // Should start with default theme
      expect(screen.getByTestId('current-theme')).toHaveTextContent(getDefaultTheme().id);
      expect(screen.getByTestId('sync-status')).toHaveTextContent('idle');
      expect(screen.getByTestId('error-status')).toHaveTextContent('no-error');
    });

    it('should change theme when button is clicked', async () => {
      render(
        <TestWrapper>
          <TestThemeComponent mode="single" />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('set-theme-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('modern-minimal');
      });
    });

    it('should reset to default theme', async () => {
      render(
        <TestWrapper>
          <TestThemeComponent mode="single" />
        </TestWrapper>
      );

      // Set a theme first
      fireEvent.click(screen.getByTestId('set-theme-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('modern-minimal');
      });

      // Reset theme
      fireEvent.click(screen.getByTestId('reset-theme-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent(getDefaultTheme().id);
      });
    });
  });

  describe('Presentation Mode Theme Management', () => {
    it('should manage themes independently in presentation mode', async () => {
      render(
        <TestWrapper>
          <TestThemeComponent mode="presentation" />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('set-creative-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('creative-vibrant');
      });
    });
  });

  describe('Mode-Specific Theme Persistence', () => {
    it('should maintain separate themes for different modes', async () => {
      const { rerender } = render(
        <TestWrapper>
          <TestThemeComponent mode="single" />
        </TestWrapper>
      );

      // Set theme in single mode
      fireEvent.click(screen.getByTestId('set-theme-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('modern-minimal');
      });

      // Switch to presentation mode
      rerender(
        <TestWrapper>
          <TestThemeComponent mode="presentation" />
        </TestWrapper>
      );

      // Set different theme in presentation mode
      fireEvent.click(screen.getByTestId('set-creative-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('creative-vibrant');
      });

      // Verify mode-specific themes are maintained
      expect(screen.getByTestId('single-mode-theme')).toHaveTextContent('modern-minimal');
      expect(screen.getByTestId('presentation-mode-theme')).toHaveTextContent('creative-vibrant');
    });
  });

  describe('Theme Persistence Across Remounts', () => {
    it('should restore theme from localStorage after remount', async () => {
      // Set up initial theme
      mockLocalStorage.setItem('ai-ppt-ai-ppt-selected-theme', 'modern-minimal');
      mockLocalStorage.setItem('ai-ppt-ai-ppt-single-mode-theme', 'modern-minimal');

      const { unmount } = render(
        <TestWrapper>
          <TestThemeComponent mode="single" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('modern-minimal');
      });

      // Unmount and remount
      unmount();
      
      render(
        <TestWrapper>
          <TestThemeComponent mode="single" />
        </TestWrapper>
      );

      // Should restore the theme
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('modern-minimal');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid theme IDs gracefully', async () => {
      const TestErrorComponent: React.FC = () => {
        const themeSync = useThemeSync({ mode: 'single' });

        return (
          <div>
            <div data-testid="error-status">{themeSync.error || 'no-error'}</div>
            <button
              data-testid="invalid-theme-btn"
              onClick={() => themeSync.setTheme('invalid-theme-id')}
            >
              Set Invalid Theme
            </button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestErrorComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('invalid-theme-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('error-status')).toHaveTextContent('Invalid theme ID');
      });
    });
  });

  describe('Force Sync Functionality', () => {
    it('should force synchronization when requested', async () => {
      render(
        <TestWrapper>
          <TestThemeComponent mode="single" />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('force-sync-btn'));

      // Force sync should not change the theme but should trigger sync process
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent(getDefaultTheme().id);
      });
    });
  });

  describe('Multiple Component Synchronization', () => {
    it('should synchronize themes across multiple components', async () => {
      const MultiComponentTest: React.FC = () => (
        <div>
          <TestThemeComponent mode="single" />
          <div data-testid="separator">---</div>
          <TestThemeComponent mode="single" />
        </div>
      );

      render(
        <TestWrapper>
          <MultiComponentTest />
        </TestWrapper>
      );

      const themeDisplays = screen.getAllByTestId('current-theme');
      const setThemeButtons = screen.getAllByTestId('set-theme-btn');

      // Click first component's button
      fireEvent.click(setThemeButtons[0]);

      // Both components should show the same theme
      await waitFor(() => {
        themeDisplays.forEach(display => {
          expect(display).toHaveTextContent('modern-minimal');
        });
      });
    });
  });
});
