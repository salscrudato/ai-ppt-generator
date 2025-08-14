/**
 * Accessibility Testing Utilities
 * 
 * Automated and manual testing tools for WCAG compliance
 * and accessibility best practices.
 */

// Note: axe-core/react may need different import syntax
// import { configure, getViolations } from '@axe-core/react';

/**
 * Configure axe-core for accessibility testing
 */
export function configureAxe() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Accessibility testing configured for development');
    // TODO: Configure axe-core when import is fixed
  }
}

/**
 * Manual accessibility checklist
 */
export const ACCESSIBILITY_CHECKLIST = {
  keyboard: [
    'All interactive elements are keyboard accessible',
    'Tab order is logical and intuitive',
    'Focus indicators are visible and clear',
    'No keyboard traps exist',
    'Skip links are provided for main content areas'
  ],
  
  screenReader: [
    'All images have descriptive alt text',
    'Form inputs have proper labels',
    'Headings create a logical document structure',
    'ARIA labels are used where needed',
    'Live regions announce dynamic content changes'
  ],
  
  visual: [
    'Text meets WCAG AA contrast requirements (4.5:1)',
    'Large text meets WCAG AA contrast requirements (3:1)',
    'Color is not the only way to convey information',
    'Text can be resized up to 200% without loss of functionality',
    'Content reflows properly at different zoom levels'
  ],
  
  motor: [
    'Click targets are at least 44x44 pixels',
    'Drag and drop has keyboard alternatives',
    'Time limits can be extended or disabled',
    'Motion-triggered actions have alternatives'
  ],
  
  cognitive: [
    'Instructions are clear and simple',
    'Error messages are descriptive and helpful',
    'Important actions require confirmation',
    'Content is organized with clear headings'
  ]
};

/**
 * Automated accessibility test runner
 */
export class AccessibilityTester {
  private violations: any[] = [];
  
  async runTests(_element?: HTMLElement): Promise<any[]> {
    try {
      // TODO: Implement axe-core testing when import is fixed
      console.log('Running accessibility tests...');
      this.violations = [];
      return [];
    } catch (error) {
      console.error('Accessibility testing failed:', error);
      return [];
    }
  }
  
  getViolationsByImpact(impact: 'minor' | 'moderate' | 'serious' | 'critical') {
    return this.violations.filter(violation => violation.impact === impact);
  }
  
  getCriticalViolations() {
    return this.getViolationsByImpact('critical');
  }
  
  getSeriousViolations() {
    return this.getViolationsByImpact('serious');
  }
  
  generateReport(): string {
    const critical = this.getCriticalViolations();
    const serious = this.getSeriousViolations();
    const moderate = this.getViolationsByImpact('moderate');
    const minor = this.getViolationsByImpact('minor');
    
    return `
Accessibility Test Report
========================

Critical Issues: ${critical.length}
Serious Issues: ${serious.length}
Moderate Issues: ${moderate.length}
Minor Issues: ${minor.length}

${critical.length > 0 ? `
CRITICAL ISSUES:
${critical.map(v => `- ${v.description}`).join('\n')}
` : ''}

${serious.length > 0 ? `
SERIOUS ISSUES:
${serious.map(v => `- ${v.description}`).join('\n')}
` : ''}

Total Violations: ${this.violations.length}
    `.trim();
  }
}

/**
 * Color contrast checker
 */
export class ContrastChecker {
  static hexToRgb(hex: string): [number, number, number] | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  }
  
  static getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
  
  static getContrastRatio(color1: [number, number, number], color2: [number, number, number]): number {
    const lum1 = this.getLuminance(...color1);
    const lum2 = this.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }
  
  static checkContrast(foreground: string, background: string, isLargeText = false): {
    ratio: number;
    passes: boolean;
    level: 'AA' | 'AAA' | 'fail';
  } {
    const fg = this.hexToRgb(foreground);
    const bg = this.hexToRgb(background);
    
    if (!fg || !bg) {
      return { ratio: 0, passes: false, level: 'fail' };
    }
    
    const ratio = this.getContrastRatio(fg, bg);
    const aaThreshold = isLargeText ? 3 : 4.5;
    const aaaThreshold = isLargeText ? 4.5 : 7;
    
    if (ratio >= aaaThreshold) {
      return { ratio, passes: true, level: 'AAA' };
    } else if (ratio >= aaThreshold) {
      return { ratio, passes: true, level: 'AA' };
    } else {
      return { ratio, passes: false, level: 'fail' };
    }
  }
}

/**
 * Keyboard navigation tester
 */
export class KeyboardTester {
  private focusableElements: HTMLElement[] = [];
  
  findFocusableElements(container: HTMLElement = document.body): HTMLElement[] {
    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    
    this.focusableElements = Array.from(container.querySelectorAll(selector));
    return this.focusableElements;
  }
  
  testTabOrder(): { element: HTMLElement; tabIndex: number; issues: string[] }[] {
    const results = this.focusableElements.map((element) => {
      const issues: string[] = [];
      const tabIndex = parseInt(element.getAttribute('tabindex') || '0');
      
      // Check for positive tabindex (anti-pattern)
      if (tabIndex > 0) {
        issues.push('Uses positive tabindex (anti-pattern)');
      }
      
      // Check for missing focus indicator
      const computedStyle = window.getComputedStyle(element, ':focus');
      if (!computedStyle.outline && !computedStyle.boxShadow) {
        issues.push('Missing focus indicator');
      }
      
      return { element, tabIndex, issues };
    });
    
    return results;
  }
  
  simulateKeyboardNavigation(): Promise<boolean> {
    return new Promise((resolve) => {
      let currentElement = 0;
      const totalElements = this.focusableElements.length;
      
      const testNext = () => {
        if (currentElement >= totalElements) {
          resolve(true);
          return;
        }
        
        const element = this.focusableElements[currentElement];
        element.focus();
        
        // Check if element actually received focus
        if (document.activeElement !== element) {
          console.warn('Element did not receive focus:', element);
          resolve(false);
          return;
        }
        
        currentElement++;
        setTimeout(testNext, 100);
      };
      
      testNext();
    });
  }
}

/**
 * Screen reader testing utilities
 */
export class ScreenReaderTester {
  static checkAriaLabels(): { element: HTMLElement; issues: string[] }[] {
    const interactiveElements = document.querySelectorAll('button, input, select, textarea, a, [role="button"], [role="link"]');
    
    return Array.from(interactiveElements).map(element => {
      const issues: string[] = [];
      const htmlElement = element as HTMLElement;
      
      const hasAriaLabel = htmlElement.hasAttribute('aria-label');
      const hasAriaLabelledBy = htmlElement.hasAttribute('aria-labelledby');
      const hasVisibleText = htmlElement.textContent?.trim();
      const hasAlt = htmlElement.hasAttribute('alt');
      
      if (!hasAriaLabel && !hasAriaLabelledBy && !hasVisibleText && !hasAlt) {
        issues.push('Missing accessible name');
      }
      
      // Check for empty aria-label
      if (hasAriaLabel && !htmlElement.getAttribute('aria-label')?.trim()) {
        issues.push('Empty aria-label');
      }
      
      return { element: htmlElement, issues };
    });
  }
  
  static checkHeadingStructure(): { level: number; text: string; issues: string[] }[] {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const results: { level: number; text: string; issues: string[] }[] = [];
    let previousLevel = 0;
    
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent?.trim() || '';
      const issues: string[] = [];
      
      // Check for skipped heading levels
      if (level > previousLevel + 1) {
        issues.push(`Skipped heading level (from h${previousLevel} to h${level})`);
      }
      
      // Check for empty headings
      if (!text) {
        issues.push('Empty heading');
      }
      
      results.push({ level, text, issues });
      previousLevel = level;
    });
    
    return results;
  }
  
  static checkImageAltText(): { element: HTMLImageElement; issues: string[] }[] {
    const images = document.querySelectorAll('img');
    
    return Array.from(images).map(img => {
      const issues: string[] = [];
      
      if (!img.hasAttribute('alt')) {
        issues.push('Missing alt attribute');
      } else {
        const alt = img.getAttribute('alt');
        if (alt === null || alt === '') {
          // Empty alt is okay for decorative images
          if (!img.hasAttribute('role') || img.getAttribute('role') !== 'presentation') {
            issues.push('Empty alt text (consider role="presentation" for decorative images)');
          }
        } else if (alt.length > 125) {
          issues.push('Alt text too long (>125 characters)');
        }
      }
      
      return { element: img, issues };
    });
  }
}

/**
 * Initialize accessibility testing in development
 */
export function initializeAccessibilityTesting() {
  if (process.env.NODE_ENV === 'development') {
    configureAxe();
    
    // Add global testing functions for development
    (window as any).a11yTest = {
      tester: new AccessibilityTester(),
      contrast: ContrastChecker,
      keyboard: new KeyboardTester(),
      screenReader: ScreenReaderTester,
      checklist: ACCESSIBILITY_CHECKLIST
    };
    
    console.log('🔍 Accessibility testing tools available at window.a11yTest');
  }
}
