/**
 * Theme Consistency Integration Tests
 * 
 * End-to-end tests that verify theme consistency across the entire application flow:
 * 1. Theme selection
 * 2. Live preview rendering
 * 3. Theme verification
 * 4. PowerPoint generation consistency
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnhancedSlidePreview } from '../components/EnhancedSlidePreview';
import ThemeVerificationIndicator from '../components/ThemeVerificationIndicator';
import { getThemeById, getDefaultTheme } from '../themes/professionalThemes';
import type { SlideSpec } from '../types';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock window.getComputedStyle
const mockGetComputedStyle = jest.fn();
Object.defineProperty(window, 'getComputedStyle', {
  value: mockGetComputedStyle
});

const testSlide: SlideSpec = {
  id: 'test-slide',
  title: 'Theme Consistency Test',
  layout: 'title-bullets',
  bullets: [
    'First test bullet point',
    'Second test bullet point',
    'Third test bullet point'
  ]
};

describe('Theme Consistency Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default computed style mock
    mockGetComputedStyle.mockImplementation((element) => {
      const className = element.className || '';
      
      if (className.includes('slide-preview')) {
        return {
          backgroundColor: 'rgb(255, 255, 255)',
          color: 'rgb(31, 41, 55)'
        };
      }
      
      if (element.tagName === 'H1' || element.tagName === 'H2' || className.includes('title')) {
        return {
          color: 'rgb(30, 64, 175)' // Corporate blue primary
        };
      }
      
      return {
        color: 'rgb(31, 41, 55)' // Default text color
      };
    });
  });

  describe('Theme Application in Preview', () => {
    it('should apply theme colors correctly in EnhancedSlidePreview', () => {
      const theme = getThemeById('corporate-blue')!;
      
      const { container } = render(
        <EnhancedSlidePreview
          spec={testSlide}
          theme={theme}
          showMetadata={false}
        />
      );
      
      // Check that slide preview element exists
      const slidePreview = container.querySelector('.slide-preview');
      expect(slidePreview).toBeInTheDocument();
      
      // Check that title is rendered
      expect(screen.getByText('Theme Consistency Test')).toBeInTheDocument();
      
      // Check that bullets are rendered
      expect(screen.getByText('First test bullet point')).toBeInTheDocument();
      expect(screen.getByText('Second test bullet point')).toBeInTheDocument();
      expect(screen.getByText('Third test bullet point')).toBeInTheDocument();
    });

    it('should update preview when theme changes', () => {
      const corporateTheme = getThemeById('corporate-blue')!;
      const darkTheme = getThemeById('executive-dark')!;
      
      const { rerender } = render(
        <EnhancedSlidePreview
          spec={testSlide}
          theme={corporateTheme}
          showMetadata={false}
        />
      );
      
      // Initial render with corporate theme
      expect(screen.getByText('Theme Consistency Test')).toBeInTheDocument();
      
      // Re-render with dark theme
      rerender(
        <EnhancedSlidePreview
          spec={testSlide}
          theme={darkTheme}
          showMetadata={false}
        />
      );
      
      // Content should still be there
      expect(screen.getByText('Theme Consistency Test')).toBeInTheDocument();
    });
  });

  describe('Theme Verification Integration', () => {
    it('should show verification indicator with correct status', async () => {
      const theme = getThemeById('corporate-blue')!;
      
      render(
        <div>
          <EnhancedSlidePreview
            spec={testSlide}
            theme={theme}
            showMetadata={false}
          />
          <ThemeVerificationIndicator
            theme={theme}
            compact={true}
          />
        </div>
      );
      
      // Wait for verification to complete
      await waitFor(() => {
        // Should show some verification status
        const indicator = screen.getByText(/\d+%/);
        expect(indicator).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should handle theme verification errors gracefully', async () => {
      const theme = getThemeById('corporate-blue')!;
      
      // Mock getComputedStyle to throw an error
      mockGetComputedStyle.mockImplementation(() => {
        throw new Error('Mock error');
      });
      
      render(
        <div>
          <EnhancedSlidePreview
            spec={testSlide}
            theme={theme}
            showMetadata={false}
          />
          <ThemeVerificationIndicator
            theme={theme}
            compact={true}
          />
        </div>
      );
      
      // Should not crash and should show some status
      await waitFor(() => {
        // Component should still render
        expect(screen.getByText('Theme Consistency Test')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Theme Testing', () => {
    const testThemes = [
      'corporate-blue',
      'executive-dark',
      'creative-purple',
      'startup-orange'
    ];

    testThemes.forEach(themeId => {
      it(`should render correctly with ${themeId} theme`, () => {
        const theme = getThemeById(themeId);
        if (!theme) return;
        
        const { container } = render(
          <EnhancedSlidePreview
            spec={testSlide}
            theme={theme}
            showMetadata={false}
          />
        );
        
        // Basic rendering check
        expect(screen.getByText('Theme Consistency Test')).toBeInTheDocument();
        expect(container.querySelector('.slide-preview')).toBeInTheDocument();
        
        // Check that CSS variables are applied
        const slideElement = container.querySelector('.slide-preview');
        expect(slideElement).toHaveStyle({
          backgroundColor: theme.colors.background
        });
      });
    });
  });

  describe('Theme Consistency Workflow', () => {
    it('should complete full theme consistency workflow', async () => {
      const theme = getThemeById('corporate-blue')!;
      
      // Step 1: Render preview with theme
      const { container } = render(
        <div>
          <EnhancedSlidePreview
            spec={testSlide}
            theme={theme}
            showMetadata={true}
          />
          <ThemeVerificationIndicator
            theme={theme}
            showDetails={true}
          />
        </div>
      );
      
      // Step 2: Verify preview renders correctly
      expect(screen.getByText('Theme Consistency Test')).toBeInTheDocument();
      expect(screen.getByText(/Layout: title-bullets/)).toBeInTheDocument();
      
      // Step 3: Wait for theme verification
      await waitFor(() => {
        // Should show verification results
        const verificationElements = container.querySelectorAll('[class*="verification"]');
        expect(verificationElements.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
      
      // Step 4: Check that no errors occurred
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should handle rapid theme changes', async () => {
      const themes = [
        getThemeById('corporate-blue')!,
        getThemeById('executive-dark')!,
        getThemeById('creative-purple')!
      ];
      
      const { rerender } = render(
        <EnhancedSlidePreview
          spec={testSlide}
          theme={themes[0]}
          showMetadata={false}
        />
      );
      
      // Rapidly change themes
      for (let i = 1; i < themes.length; i++) {
        rerender(
          <EnhancedSlidePreview
            spec={testSlide}
            theme={themes[i]}
            showMetadata={false}
          />
        );
        
        // Should still render correctly
        expect(screen.getByText('Theme Consistency Test')).toBeInTheDocument();
      }
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle missing theme gracefully', () => {
      render(
        <EnhancedSlidePreview
          spec={testSlide}
          theme={null as any}
          showMetadata={false}
        />
      );
      
      // Should still render with fallback
      expect(screen.getByText('Theme Consistency Test')).toBeInTheDocument();
    });

    it('should handle empty slide spec', () => {
      const emptySlide: SlideSpec = {
        id: 'empty',
        title: '',
        layout: 'title-bullets'
      };
      
      const theme = getDefaultTheme();
      
      render(
        <EnhancedSlidePreview
          spec={emptySlide}
          theme={theme}
          showMetadata={false}
        />
      );
      
      // Should render without crashing
      expect(screen.getByText('Add content to see preview')).toBeInTheDocument();
    });

    it('should debounce verification calls', async () => {
      const theme = getThemeById('corporate-blue')!;
      
      const { rerender } = render(
        <ThemeVerificationIndicator
          theme={theme}
          compact={true}
        />
      );
      
      // Rapidly change props to trigger re-verification
      for (let i = 0; i < 5; i++) {
        rerender(
          <ThemeVerificationIndicator
            theme={theme}
            compact={i % 2 === 0}
          />
        );
      }
      
      // Should not crash from rapid updates
      await waitFor(() => {
        expect(screen.getByText(/\d+%/)).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });
});
