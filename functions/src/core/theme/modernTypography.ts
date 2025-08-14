/**
 * Modern Typography System for Professional PowerPoint Generation
 *
 * Advanced typography with modern font pairings, enhanced hierarchy,
 * and sophisticated text styling options.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

/**
 * Modern font stack definitions optimized for PowerPoint
 */
export const MODERN_FONT_STACKS = {
  // Sans-serif fonts for modern, clean look
  INTER: '"Inter", "SF Pro Display", "Segoe UI", system-ui, sans-serif',
  POPPINS: '"Poppins", "SF Pro Display", "Segoe UI", system-ui, sans-serif',
  MONTSERRAT: '"Montserrat", "SF Pro Display", "Segoe UI", system-ui, sans-serif',
  ROBOTO: '"Roboto", "SF Pro Display", "Segoe UI", system-ui, sans-serif',
  LATO: '"Lato", "SF Pro Display", "Segoe UI", system-ui, sans-serif',
  
  // Serif fonts for traditional, elegant presentations
  PLAYFAIR: '"Playfair Display", "Times New Roman", serif',
  CRIMSON: '"Crimson Text", "Times New Roman", serif',
  LORA: '"Lora", "Times New Roman", serif',
  
  // Monospace fonts for code and technical content
  JETBRAINS: '"JetBrains Mono", "SF Mono", "Consolas", monospace',
  FIRA_CODE: '"Fira Code", "SF Mono", "Consolas", monospace',
  
  // System fonts for maximum compatibility
  SYSTEM_SANS: 'system-ui, -apple-system, "Segoe UI", "Roboto", sans-serif',
  SYSTEM_SERIF: '"Times New Roman", "Georgia", serif',
  SYSTEM_MONO: '"Consolas", "Monaco", "Courier New", monospace'
} as const;

/**
 * Typography pairing configurations for different presentation styles
 */
export interface TypographyPairing {
  id: string;
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'tech' | 'creative' | 'minimal';
  heading: string;
  body: string;
  accent?: string;
  characteristics: string[];
  bestFor: string[];
}

/**
 * Curated typography pairings for professional presentations
 */
export const TYPOGRAPHY_PAIRINGS: TypographyPairing[] = [
  {
    id: 'inter-modern',
    name: 'Inter Modern',
    description: 'Clean, highly legible sans-serif perfect for modern presentations',
    category: 'modern',
    heading: MODERN_FONT_STACKS.INTER,
    body: MODERN_FONT_STACKS.INTER,
    characteristics: ['Highly legible', 'Modern', 'Versatile', 'Professional'],
    bestFor: ['Corporate presentations', 'Data visualization', 'Tech companies']
  },
  
  {
    id: 'poppins-friendly',
    name: 'Poppins Friendly',
    description: 'Rounded, approachable sans-serif for engaging presentations',
    category: 'modern',
    heading: MODERN_FONT_STACKS.POPPINS,
    body: MODERN_FONT_STACKS.POPPINS,
    characteristics: ['Friendly', 'Rounded', 'Approachable', 'Modern'],
    bestFor: ['Marketing presentations', 'Startups', 'Creative agencies']
  },
  
  {
    id: 'montserrat-bold',
    name: 'Montserrat Bold',
    description: 'Strong, geometric sans-serif for impactful presentations',
    category: 'modern',
    heading: MODERN_FONT_STACKS.MONTSERRAT,
    body: MODERN_FONT_STACKS.LATO,
    characteristics: ['Bold', 'Geometric', 'Impactful', 'Strong'],
    bestFor: ['Executive presentations', 'Sales pitches', 'Brand presentations']
  },
  
  {
    id: 'playfair-elegant',
    name: 'Playfair Elegant',
    description: 'Sophisticated serif pairing for luxury and premium presentations',
    category: 'classic',
    heading: MODERN_FONT_STACKS.PLAYFAIR,
    body: MODERN_FONT_STACKS.LATO,
    characteristics: ['Elegant', 'Sophisticated', 'Luxury', 'Traditional'],
    bestFor: ['Luxury brands', 'Financial services', 'Legal presentations']
  },
  
  {
    id: 'roboto-tech',
    name: 'Roboto Tech',
    description: 'Technical, precise sans-serif perfect for data and tech presentations',
    category: 'tech',
    heading: MODERN_FONT_STACKS.ROBOTO,
    body: MODERN_FONT_STACKS.ROBOTO,
    accent: MODERN_FONT_STACKS.JETBRAINS,
    characteristics: ['Technical', 'Precise', 'Clean', 'Data-friendly'],
    bestFor: ['Technical presentations', 'Data analysis', 'Engineering']
  },
  
  {
    id: 'minimal-system',
    name: 'Minimal System',
    description: 'Clean system fonts for maximum compatibility and minimalism',
    category: 'minimal',
    heading: MODERN_FONT_STACKS.SYSTEM_SANS,
    body: MODERN_FONT_STACKS.SYSTEM_SANS,
    characteristics: ['Minimal', 'Compatible', 'Clean', 'Universal'],
    bestFor: ['Any presentation', 'Maximum compatibility', 'Simple designs']
  }
];

/**
 * Advanced typography scale with modern proportions
 */
export const MODERN_TYPOGRAPHY_SCALE = {
  // Display sizes for hero content
  HERO: 56,        // Extra large hero text
  DISPLAY: 48,     // Large display text
  
  // Heading hierarchy
  H1: 40,          // Main slide titles
  H2: 32,          // Section headers
  H3: 26,          // Subsection headers
  H4: 22,          // Small headers
  H5: 20,          // Micro headers
  
  // Body text sizes
  LARGE: 20,       // Large body text
  BODY: 18,        // Standard body text
  MEDIUM: 16,      // Medium body text
  SMALL: 14,       // Small text
  CAPTION: 12,     // Captions and fine print
  TINY: 10         // Very small text
} as const;

/**
 * Line height ratios for optimal readability
 */
export const LINE_HEIGHT_RATIOS = {
  TIGHT: 1.1,      // For large headings
  SNUG: 1.2,       // For medium headings
  NORMAL: 1.3,     // For body text
  RELAXED: 1.4,    // For long-form content
  LOOSE: 1.5       // For very readable content
} as const;

/**
 * Letter spacing values for different text sizes
 */
export const LETTER_SPACING = {
  TIGHT: -0.02,    // For large text
  NORMAL: 0,       // Standard spacing
  WIDE: 0.02,      // For small text
  EXTRA_WIDE: 0.04 // For very small text
} as const;

/**
 * Text styling presets for common use cases
 */
export interface TextStylePreset {
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize';
  color?: string;
}

export const TEXT_STYLE_PRESETS: Record<string, TextStylePreset> = {
  HERO_TITLE: {
    fontSize: MODERN_TYPOGRAPHY_SCALE.HERO,
    fontWeight: 800,
    lineHeight: LINE_HEIGHT_RATIOS.TIGHT,
    letterSpacing: LETTER_SPACING.TIGHT
  },
  
  SLIDE_TITLE: {
    fontSize: MODERN_TYPOGRAPHY_SCALE.H1,
    fontWeight: 700,
    lineHeight: LINE_HEIGHT_RATIOS.SNUG,
    letterSpacing: LETTER_SPACING.TIGHT
  },
  
  SECTION_HEADER: {
    fontSize: MODERN_TYPOGRAPHY_SCALE.H2,
    fontWeight: 600,
    lineHeight: LINE_HEIGHT_RATIOS.SNUG,
    letterSpacing: LETTER_SPACING.NORMAL
  },
  
  SUBSECTION_HEADER: {
    fontSize: MODERN_TYPOGRAPHY_SCALE.H3,
    fontWeight: 600,
    lineHeight: LINE_HEIGHT_RATIOS.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL
  },
  
  BODY_TEXT: {
    fontSize: MODERN_TYPOGRAPHY_SCALE.BODY,
    fontWeight: 400,
    lineHeight: LINE_HEIGHT_RATIOS.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL
  },
  
  LARGE_BODY: {
    fontSize: MODERN_TYPOGRAPHY_SCALE.LARGE,
    fontWeight: 400,
    lineHeight: LINE_HEIGHT_RATIOS.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL
  },
  
  SMALL_TEXT: {
    fontSize: MODERN_TYPOGRAPHY_SCALE.SMALL,
    fontWeight: 400,
    lineHeight: LINE_HEIGHT_RATIOS.RELAXED,
    letterSpacing: LETTER_SPACING.WIDE
  },
  
  CAPTION: {
    fontSize: MODERN_TYPOGRAPHY_SCALE.CAPTION,
    fontWeight: 400,
    lineHeight: LINE_HEIGHT_RATIOS.RELAXED,
    letterSpacing: LETTER_SPACING.WIDE
  },
  
  BUTTON_TEXT: {
    fontSize: MODERN_TYPOGRAPHY_SCALE.MEDIUM,
    fontWeight: 600,
    lineHeight: LINE_HEIGHT_RATIOS.TIGHT,
    letterSpacing: LETTER_SPACING.WIDE,
    textTransform: 'uppercase'
  },
  
  LABEL: {
    fontSize: MODERN_TYPOGRAPHY_SCALE.SMALL,
    fontWeight: 500,
    lineHeight: LINE_HEIGHT_RATIOS.TIGHT,
    letterSpacing: LETTER_SPACING.EXTRA_WIDE,
    textTransform: 'uppercase'
  }
};

/**
 * Get typography pairing by ID
 */
export function getTypographyPairing(id: string): TypographyPairing | undefined {
  return TYPOGRAPHY_PAIRINGS.find(pairing => pairing.id === id);
}

/**
 * Get typography pairings by category
 */
export function getTypographyPairingsByCategory(category: TypographyPairing['category']): TypographyPairing[] {
  return TYPOGRAPHY_PAIRINGS.filter(pairing => pairing.category === category);
}

/**
 * Create PowerPoint text options with modern typography
 */
export function createModernTextOptions(
  preset: keyof typeof TEXT_STYLE_PRESETS,
  pairing: TypographyPairing,
  color: string,
  additionalOptions: any = {}
): any {
  const style = TEXT_STYLE_PRESETS[preset];
  const isHeading = preset.includes('TITLE') || preset.includes('HEADER');
  
  return {
    fontSize: style.fontSize,
    fontFace: isHeading ? pairing.heading : pairing.body,
    color,
    bold: style.fontWeight >= 600,
    lineSpacing: Math.round(style.lineHeight * 100),
    charSpacing: style.letterSpacing * 100,
    ...additionalOptions
  };
}

/**
 * Calculate optimal font size based on text length and container size
 */
export function calculateOptimalFontSize(
  text: string,
  containerWidth: number,
  containerHeight: number,
  minSize: number = 12,
  maxSize: number = 48
): number {
  const textLength = text.length;
  const area = containerWidth * containerHeight;
  
  // Base calculation: larger area and shorter text = larger font
  let fontSize = Math.sqrt(area * 100 / textLength);
  
  // Clamp to min/max bounds
  fontSize = Math.max(minSize, Math.min(maxSize, fontSize));
  
  return Math.round(fontSize);
}

/**
 * Generate text hierarchy for a slide
 */
export function generateTextHierarchy(
  title: string,
  subtitle?: string,
  body?: string[]
): {
  title: TextStylePreset;
  subtitle?: TextStylePreset;
  body?: TextStylePreset;
} {
  return {
    title: TEXT_STYLE_PRESETS.SLIDE_TITLE,
    subtitle: subtitle ? TEXT_STYLE_PRESETS.SUBSECTION_HEADER : undefined,
    body: body ? TEXT_STYLE_PRESETS.BODY_TEXT : undefined
  };
}
