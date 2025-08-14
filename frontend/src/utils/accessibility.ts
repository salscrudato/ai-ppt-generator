/**
 * Accessibility Utilities
 * 
 * Comprehensive accessibility helpers for WCAG AA compliance,
 * keyboard navigation, screen reader support, and inclusive design.
 */

/**
 * ARIA Live Region Manager
 */
export class AriaLiveRegion {
  private static instance: AriaLiveRegion;
  private politeRegion: HTMLElement | null = null;
  private assertiveRegion: HTMLElement | null = null;

  static getInstance(): AriaLiveRegion {
    if (!AriaLiveRegion.instance) {
      AriaLiveRegion.instance = new AriaLiveRegion();
    }
    return AriaLiveRegion.instance;
  }

  private constructor() {
    this.createLiveRegions();
  }

  private createLiveRegions() {
    // Create polite live region
    this.politeRegion = document.createElement('div');
    this.politeRegion.setAttribute('aria-live', 'polite');
    this.politeRegion.setAttribute('aria-atomic', 'true');
    this.politeRegion.className = 'sr-only';
    this.politeRegion.id = 'aria-live-polite';

    // Create assertive live region
    this.assertiveRegion = document.createElement('div');
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveRegion.className = 'sr-only';
    this.assertiveRegion.id = 'aria-live-assertive';

    // Add to document
    document.body.appendChild(this.politeRegion);
    document.body.appendChild(this.assertiveRegion);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion;
    if (region) {
      // Clear and set new message
      region.textContent = '';
      setTimeout(() => {
        region!.textContent = message;
      }, 100);
    }
  }

  announceSlideChange(slideNumber: number, totalSlides: number, slideTitle: string) {
    this.announce(
      `Slide ${slideNumber} of ${totalSlides}: ${slideTitle}`,
      'polite'
    );
  }

  announceLoadingState(message: string) {
    this.announce(message, 'polite');
  }

  announceError(message: string) {
    this.announce(`Error: ${message}`, 'assertive');
  }

  announceSuccess(message: string) {
    this.announce(message, 'polite');
  }
}

/**
 * Keyboard Navigation Utilities
 */
export const KeyboardUtils = {
  /**
   * Handle arrow key navigation in a list
   */
  handleArrowNavigation(
    event: KeyboardEvent,
    currentIndex: number,
    totalItems: number,
    onIndexChange: (newIndex: number) => void,
    orientation: 'horizontal' | 'vertical' = 'vertical'
  ) {
    const { key } = event;
    let newIndex = currentIndex;

    if (orientation === 'vertical') {
      if (key === 'ArrowDown') {
        newIndex = (currentIndex + 1) % totalItems;
      } else if (key === 'ArrowUp') {
        newIndex = currentIndex === 0 ? totalItems - 1 : currentIndex - 1;
      }
    } else {
      if (key === 'ArrowRight') {
        newIndex = (currentIndex + 1) % totalItems;
      } else if (key === 'ArrowLeft') {
        newIndex = currentIndex === 0 ? totalItems - 1 : currentIndex - 1;
      }
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      onIndexChange(newIndex);
    }
  },

  /**
   * Handle Home/End navigation
   */
  handleHomeEndNavigation(
    event: KeyboardEvent,
    totalItems: number,
    onIndexChange: (newIndex: number) => void
  ) {
    const { key } = event;
    
    if (key === 'Home') {
      event.preventDefault();
      onIndexChange(0);
    } else if (key === 'End') {
      event.preventDefault();
      onIndexChange(totalItems - 1);
    }
  },

  /**
   * Create keyboard event handler for buttons
   */
  createButtonKeyHandler(onClick: () => void) {
    return (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    };
  }
};

/**
 * Focus Management Utilities
 */
export const FocusUtils = {
  /**
   * Trap focus within an element
   */
  trapFocus(element: HTMLElement) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  /**
   * Save and restore focus
   */
  saveFocus(): () => void {
    const activeElement = document.activeElement as HTMLElement;
    return () => {
      if (activeElement && activeElement.focus) {
        activeElement.focus();
      }
    };
  },

  /**
   * Focus first error in form
   */
  focusFirstError(formElement: HTMLElement) {
    const errorElement = formElement.querySelector('[aria-invalid="true"]') as HTMLElement;
    if (errorElement) {
      errorElement.focus();
    }
  }
};

/**
 * Color Contrast Utilities
 */
export const ContrastUtils = {
  /**
   * Calculate relative luminance
   */
  getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio(color1: [number, number, number], color2: [number, number, number]): number {
    const lum1 = this.getLuminance(...color1);
    const lum2 = this.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if contrast meets WCAG AA standards
   */
  meetsWCAGAA(color1: [number, number, number], color2: [number, number, number], isLargeText = false): boolean {
    const ratio = this.getContrastRatio(color1, color2);
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  },

  /**
   * Convert hex to RGB
   */
  hexToRgb(hex: string): [number, number, number] | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  }
};

/**
 * Screen Reader Utilities
 */
export const ScreenReaderUtils = {
  /**
   * Generate accessible description for slide content
   */
  generateSlideDescription(slide: any): string {
    const parts = [];
    
    if (slide.title) {
      parts.push(`Title: ${slide.title}`);
    }
    
    if (slide.content && slide.content.length > 0) {
      parts.push(`Content: ${slide.content.join(', ')}`);
    }
    
    if (slide.layout) {
      parts.push(`Layout: ${slide.layout}`);
    }
    
    return parts.join('. ');
  },

  /**
   * Generate accessible name for theme
   */
  generateThemeDescription(theme: any): string {
    return `${theme.name} theme. ${theme.description || 'Professional presentation theme.'}`;
  },

  /**
   * Create accessible loading message
   */
  createLoadingMessage(stage: string, progress?: number): string {
    const progressText = progress ? ` ${Math.round(progress)}% complete` : '';
    return `${stage}${progressText}. Please wait.`;
  }
};

/**
 * Accessibility Testing Utilities
 */
export const A11yTestUtils = {
  /**
   * Check for missing alt text
   */
  checkMissingAltText(): HTMLImageElement[] {
    const images = Array.from(document.querySelectorAll('img'));
    return images.filter(img => !img.alt && !img.getAttribute('aria-label'));
  },

  /**
   * Check for missing form labels
   */
  checkMissingFormLabels(): HTMLInputElement[] {
    const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
    return inputs.filter(input => {
      const id = input.id;
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label');
      const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
      return !hasLabel && !hasAriaLabel && !hasAriaLabelledBy;
    }) as HTMLInputElement[];
  },

  /**
   * Check for keyboard accessibility
   */
  checkKeyboardAccessibility(): HTMLElement[] {
    const interactive = Array.from(document.querySelectorAll('button, a, input, select, textarea, [tabindex]'));
    return interactive.filter(el => {
      const tabIndex = el.getAttribute('tabindex');
      return tabIndex === '-1' && !el.hasAttribute('aria-hidden');
    }) as HTMLElement[];
  }
};

// Initialize ARIA live regions when module loads
if (typeof window !== 'undefined') {
  AriaLiveRegion.getInstance();
}
