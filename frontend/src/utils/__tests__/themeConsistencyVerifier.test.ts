/**
 * Theme Consistency Verifier Tests
 * 
 * Comprehensive tests for the theme consistency verification system
 */

import { ThemeConsistencyVerifier } from '../themeConsistencyVerifier';
import { getThemeById, getDefaultTheme } from '../../themes/professionalThemes';

// Mock DOM methods
Object.defineProperty(window, 'getComputedStyle', {
  value: jest.fn(() => ({
    backgroundColor: 'rgb(255, 255, 255)',
    color: 'rgb(30, 64, 175)'
  }))
});

// Mock HTML element
const createMockElement = (styles: Record<string, string> = {}) => {
  const element = document.createElement('div');
  element.className = 'slide-preview';
  
  // Add title element
  const title = document.createElement('h2');
  title.textContent = 'Test Title';
  title.className = 'slide-title';
  element.appendChild(title);
  
  // Add text element
  const text = document.createElement('p');
  text.textContent = 'Test content';
  element.appendChild(text);
  
  // Add accent element
  const accent = document.createElement('span');
  accent.className = 'bullet-point';
  accent.textContent = '•';
  element.appendChild(accent);
  
  // Mock computed styles
  jest.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
    if (el === element) {
      return {
        backgroundColor: styles.backgroundColor || 'rgb(255, 255, 255)',
        color: styles.color || 'rgb(31, 41, 55)'
      } as CSSStyleDeclaration;
    }
    if (el === title) {
      return {
        color: styles.titleColor || 'rgb(30, 64, 175)'
      } as CSSStyleDeclaration;
    }
    if (el === text) {
      return {
        color: styles.textColor || 'rgb(31, 41, 55)'
      } as CSSStyleDeclaration;
    }
    if (el === accent) {
      return {
        color: styles.accentColor || 'rgb(245, 158, 11)'
      } as CSSStyleDeclaration;
    }
    return {} as CSSStyleDeclaration;
  });
  
  return element;
};

describe('ThemeConsistencyVerifier', () => {
  let verifier: ThemeConsistencyVerifier;
  let mockElement: HTMLElement;
  
  beforeEach(() => {
    const theme = getDefaultTheme();
    verifier = new ThemeConsistencyVerifier(theme);
    mockElement = createMockElement();
    jest.clearAllMocks();
  });

  describe('Basic Theme Verification', () => {
    it('should pass verification when colors match exactly', async () => {
      const theme = getDefaultTheme();
      
      // Mock perfect color matches
      mockElement = createMockElement({
        backgroundColor: 'rgb(255, 255, 255)', // #FFFFFF
        titleColor: 'rgb(30, 64, 175)',        // #1E40AF (theme.colors.primary)
        textColor: 'rgb(31, 41, 55)',          // #1F2937 (theme.colors.text.primary)
        accentColor: 'rgb(245, 158, 11)'       // #F59E0B (theme.colors.accent)
      });
      
      const result = await verifier.verifyBasicThemeElements(mockElement);
      
      expect(result.passed).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.issues).toHaveLength(0);
      expect(result.details.background.match).toBe(true);
      expect(result.details.title.match).toBe(true);
    });

    it('should fail verification when colors do not match', async () => {
      const theme = getDefaultTheme();
      
      // Mock mismatched colors
      mockElement = createMockElement({
        backgroundColor: 'rgb(255, 0, 0)',     // Red instead of white
        titleColor: 'rgb(0, 255, 0)',          // Green instead of blue
        textColor: 'rgb(0, 0, 255)',           // Blue instead of gray
        accentColor: 'rgb(255, 255, 0)'        // Yellow instead of orange
      });
      
      const result = await verifier.verifyBasicThemeElements(mockElement);
      
      expect(result.passed).toBe(false);
      expect(result.score).toBeLessThan(85);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.details.background.match).toBe(false);
      expect(result.details.title.match).toBe(false);
    });

    it('should handle missing elements gracefully', async () => {
      // Create element without title
      const emptyElement = document.createElement('div');
      emptyElement.className = 'slide-preview';
      
      const result = await verifier.verifyBasicThemeElements(emptyElement);
      
      expect(result).toBeDefined();
      expect(result.details.title.actual).toBe('not found');
      expect(result.details.title.match).toBe(false);
    });
  });

  describe('Color Conversion and Similarity', () => {
    it('should correctly convert RGB to hex', () => {
      // Access private method through any cast for testing
      const rgbToHex = (verifier as any).rgbToHex;
      
      expect(rgbToHex('rgb(255, 255, 255)')).toBe('#FFFFFF');
      expect(rgbToHex('rgb(30, 64, 175)')).toBe('#1E40AF');
      expect(rgbToHex('rgb(0, 0, 0)')).toBe('#000000');
      expect(rgbToHex('#FF0000')).toBe('#FF0000'); // Already hex
    });

    it('should calculate color similarity correctly', () => {
      const calculateColorSimilarity = (verifier as any).calculateColorSimilarity;
      
      // Identical colors should be 100% similar
      expect(calculateColorSimilarity('#FFFFFF', '#FFFFFF')).toBe(100);
      
      // Completely different colors should have low similarity
      expect(calculateColorSimilarity('#FFFFFF', '#000000')).toBeLessThan(50);
      
      // Similar colors should have high similarity
      expect(calculateColorSimilarity('#1E40AF', '#1E41B0')).toBeGreaterThan(95);
    });
  });

  describe('Theme-specific Tests', () => {
    it('should verify corporate-blue theme correctly', async () => {
      const theme = getThemeById('corporate-blue')!;
      const corporateVerifier = new ThemeConsistencyVerifier(theme);
      
      mockElement = createMockElement({
        backgroundColor: 'rgb(255, 255, 255)',
        titleColor: 'rgb(30, 64, 175)',
        textColor: 'rgb(31, 41, 55)',
        accentColor: 'rgb(245, 158, 11)'
      });
      
      const result = await corporateVerifier.verifyBasicThemeElements(mockElement);
      
      expect(result.passed).toBe(true);
      expect(result.details.background.expected).toBe('#FFFFFF');
      expect(result.details.title.expected).toBe('#1E40AF');
    });

    it('should verify executive-dark theme correctly', async () => {
      const theme = getThemeById('executive-dark')!;
      const darkVerifier = new ThemeConsistencyVerifier(theme);
      
      mockElement = createMockElement({
        backgroundColor: 'rgb(30, 41, 59)',     // #1E293B
        titleColor: 'rgb(59, 130, 246)',        // #3B82F6
        textColor: 'rgb(248, 250, 252)',        // #F8FAFC
        accentColor: 'rgb(16, 185, 129)'        // #10B981
      });
      
      const result = await darkVerifier.verifyBasicThemeElements(mockElement);
      
      expect(result.passed).toBe(true);
      expect(result.details.background.expected).toBe('#1E293B');
      expect(result.details.title.expected).toBe('#3B82F6');
    });
  });

  describe('Scoring System', () => {
    it('should weight background and title colors more heavily', async () => {
      // Test with only background and title matching
      mockElement = createMockElement({
        backgroundColor: 'rgb(255, 255, 255)',  // Correct
        titleColor: 'rgb(30, 64, 175)',         // Correct
        textColor: 'rgb(255, 0, 0)',            // Wrong
        accentColor: 'rgb(0, 255, 0)'           // Wrong
      });
      
      const result = await verifier.verifyBasicThemeElements(mockElement);
      
      // Should still have a decent score due to background and title being correct
      expect(result.score).toBeGreaterThan(50);
    });

    it('should have low score when background and title are wrong', async () => {
      // Test with only text and accent matching
      mockElement = createMockElement({
        backgroundColor: 'rgb(255, 0, 0)',      // Wrong
        titleColor: 'rgb(0, 255, 0)',           // Wrong
        textColor: 'rgb(31, 41, 55)',           // Correct
        accentColor: 'rgb(245, 158, 11)'        // Correct
      });
      
      const result = await verifier.verifyBasicThemeElements(mockElement);
      
      // Should have low score due to background and title being wrong
      expect(result.score).toBeLessThan(50);
    });
  });

  describe('Issue Reporting', () => {
    it('should report issues with appropriate severity levels', async () => {
      mockElement = createMockElement({
        backgroundColor: 'rgb(255, 0, 0)',      // High severity - background
        titleColor: 'rgb(0, 255, 0)',           // High severity - title
        textColor: 'rgb(0, 0, 255)',            // Medium severity - text
        accentColor: 'rgb(255, 255, 0)'         // Low severity - accent
      });
      
      const result = await verifier.verifyBasicThemeElements(mockElement);
      
      const highIssues = result.issues.filter(i => i.severity === 'high');
      const mediumIssues = result.issues.filter(i => i.severity === 'medium');
      const lowIssues = result.issues.filter(i => i.severity === 'low');
      
      expect(highIssues.length).toBeGreaterThanOrEqual(2); // background + title
      expect(mediumIssues.length).toBeGreaterThanOrEqual(1); // text
      expect(lowIssues.length).toBeGreaterThanOrEqual(1); // accent
    });

    it('should provide detailed issue messages', async () => {
      mockElement = createMockElement({
        backgroundColor: 'rgb(255, 0, 0)'
      });
      
      const result = await verifier.verifyBasicThemeElements(mockElement);
      
      const backgroundIssue = result.issues.find(i => i.property === 'background-color');
      expect(backgroundIssue).toBeDefined();
      expect(backgroundIssue!.message).toContain('Background color mismatch');
      expect(backgroundIssue!.expected).toBe('#FFFFFF');
      expect(backgroundIssue!.actual).toBe('#FF0000');
    });
  });
});
