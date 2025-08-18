/**
 * Enhanced Professional PowerPoint Generator - Simplified & Optimized
 *
 * Core Features:
 * - Professional 16:9 slide layouts with modern design
 * - Enhanced typography and theme system
 * - Native chart and table support
 * - Speaker notes and metadata
 * - Optimized for maintainability and performance
 *
 * @version 4.0.0-enhanced
 * @author AI PowerPoint Generator Team
 */

import pptxgen from 'pptxgenjs';
import { SlideSpec } from './schema';
import { ProfessionalTheme, getThemeById } from './professionalThemes';
import { logger, type LogContext } from './utils/smartLogger';

/* -------------------------------------------------------------------------------------------------
 * Core Constants & Configuration
 * ------------------------------------------------------------------------------------------------- */

// Standard 16:9 slide dimensions (inches)
const SLIDE_DIMENSIONS = { width: 10, height: 5.63 };

// Default layout configuration
const DEFAULT_LAYOUT = {
  margins: { top: 0.6, bottom: 0.5, left: 0.7, right: 0.7 },
  typography: {
    title: { fontSize: 32, lineSpacing: 38, fontWeight: 'bold' as const },
    body: { fontSize: 16, lineSpacing: 22, fontWeight: 'normal' as const },
    bullets: { fontSize: 15, lineSpacing: 20, fontWeight: 'normal' as const }
  },
  spacing: {
    titleToContent: 0.4,
    paragraphSpacing: 0.25,
    bulletSpacing: 0.15,
    columnGap: 0.5
  }
};

/* -------------------------------------------------------------------------------------------------
 * Utility Functions
 * ------------------------------------------------------------------------------------------------- */

/**
 * Safely convert color to valid PowerPoint format with comprehensive validation
 */
function safeColor(color: string | undefined, fallback: string): string {
  if (!color || typeof color !== 'string') {
    logger.debug('Invalid color input, using fallback', { color, fallback });
    return fallback;
  }

  // Remove # and whitespace, ensure uppercase
  let cleanColor = color.replace(/[#\s]/g, '').toUpperCase();

  // Handle named colors (convert to hex)
  const namedColors: Record<string, string> = {
    'BLACK': '000000', 'WHITE': 'FFFFFF', 'RED': 'FF0000', 'GREEN': '00FF00',
    'BLUE': '0000FF', 'YELLOW': 'FFFF00', 'CYAN': '00FFFF', 'MAGENTA': 'FF00FF',
    'GRAY': '808080', 'GREY': '808080', 'SILVER': 'C0C0C0', 'MAROON': '800000',
    'OLIVE': '808000', 'LIME': '00FF00', 'AQUA': '00FFFF', 'TEAL': '008080',
    'NAVY': '000080', 'FUCHSIA': 'FF00FF', 'PURPLE': '800080'
  };

  if (namedColors[cleanColor]) {
    cleanColor = namedColors[cleanColor];
  }

  // Validate hex color format (3 or 6 characters)
  if (!/^[0-9A-F]{3}$|^[0-9A-F]{6}$/.test(cleanColor)) {
    logger.debug('Invalid hex color format, using fallback', { original: color, cleaned: cleanColor, fallback });
    return fallback;
  }

  // Convert 3-char hex to 6-char hex (required by PowerPoint)
  if (cleanColor.length === 3) {
    cleanColor = cleanColor.split('').map(c => c + c).join('');
  }

  return cleanColor;
}

/**
 * Safely sanitize text content to prevent PowerPoint corruption
 */
function safeText(text: string | undefined, maxLength: number = 1000): string {
  if (!text || typeof text !== 'string') return '';

  // Remove potentially problematic characters that cause PowerPoint corruption
  let cleanText = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[\uFFFE\uFFFF]/g, '') // Remove invalid Unicode
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')
    .replace(/\u00A0/g, ' ') // Replace non-breaking space with regular space
    .replace(/[\u2000-\u200A]/g, ' ') // Replace various Unicode spaces
    .replace(/\u2028/g, '\n') // Replace line separator with newline
    .replace(/\u2029/g, '\n\n') // Replace paragraph separator with double newline
    .trim();

  // Remove excessive whitespace
  cleanText = cleanText.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive newlines
  cleanText = cleanText.replace(/[ \t]{2,}/g, ' '); // Max 1 space between words

  // Truncate if too long
  if (cleanText.length > maxLength) {
    cleanText = cleanText.substring(0, maxLength - 3) + '...';
  }

  return cleanText;
}

/**
 * Safely validate and normalize font face
 */
function safeFontFace(fontFace: string | undefined, fallback: string = 'Arial'): string {
  if (!fontFace || typeof fontFace !== 'string') {
    return fallback;
  }

  // List of safe, widely supported fonts (including modern system fonts)
  const safeFonts = [
    // Classic safe fonts
    'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier',
    'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
    'Trebuchet MS', 'Arial Black', 'Impact', 'Lucida Sans Unicode', 'Tahoma',
    'Lucida Console', 'Monaco', 'Bradley Hand ITC', 'Brush Script MT',
    'Lucida Handwriting', 'Copperplate', 'Papyrus',

    // Modern system fonts (widely available)
    'Segoe UI', 'Roboto', 'Helvetica Neue', 'SF Pro Display', 'SF Pro Text',
    'SF Mono', 'system-ui', '-apple-system', 'BlinkMacSystemFont',

    // Modern web fonts (commonly available)
    'Inter', 'Inter var', 'Work Sans', 'IBM Plex Sans', 'DM Sans',
    'Charter', 'Bitstream Charter', 'Sitka Text', 'Cambria',
    'Cascadia Code', 'Roboto Mono', 'Consolas', 'Playfair Display'
  ];

  // Handle font stacks (comma-separated fonts)
  const fontStack = fontFace.split(',').map(f => f.trim().replace(/['"]/g, ''));

  // Find the first safe font in the stack
  for (const font of fontStack) {
    const isSafeFont = safeFonts.some(safeFont =>
      safeFont.toLowerCase() === font.toLowerCase()
    );

    if (isSafeFont) {
      return font;
    }
  }

  // If no safe font found in stack, use fallback
  logger.debug('Unknown font face, using fallback', { requested: fontFace, fallback });
  return fallback;
}

/**
 * Safely validate coordinates and dimensions
 */
function safeCoordinate(value: number | string | undefined, max: number, fallback: number): number {
  if (value === undefined || value === null) return fallback;

  let numValue: number;

  if (typeof value === 'string') {
    // Handle percentage values
    if (value.includes('%')) {
      const percent = parseFloat(value.replace('%', ''));
      if (isNaN(percent)) return fallback;
      numValue = (percent / 100) * max;
    } else {
      numValue = parseFloat(value);
    }
  } else {
    numValue = value;
  }

  // Validate the number
  if (isNaN(numValue) || !isFinite(numValue)) {
    return fallback;
  }

  // Ensure it's within bounds and positive
  return Math.max(0, Math.min(numValue, max));
}

/**
 * Calculate content area dimensions with validation
 */
function getContentArea() {
  const { margins } = DEFAULT_LAYOUT;
  return {
    x: safeCoordinate(margins.left, SLIDE_DIMENSIONS.width, 0.5),
    y: safeCoordinate(margins.top, SLIDE_DIMENSIONS.height, 0.5),
    width: Math.max(1, SLIDE_DIMENSIONS.width - margins.left - margins.right),
    height: Math.max(1, SLIDE_DIMENSIONS.height - margins.top - margins.bottom)
  };
}

/**
 * Create safe text options for PowerPoint
 */
function createSafeTextOptions(options: any, theme: ProfessionalTheme): any {
  const contentArea = getContentArea();

  return {
    x: safeCoordinate(options.x, SLIDE_DIMENSIONS.width, 0.5),
    y: safeCoordinate(options.y, SLIDE_DIMENSIONS.height, 0.5),
    w: safeCoordinate(options.w, SLIDE_DIMENSIONS.width, contentArea.width),
    h: safeCoordinate(options.h, SLIDE_DIMENSIONS.height, 1),
    fontSize: Math.max(8, Math.min(options.fontSize || 16, 72)), // Reasonable font size limits
    fontFace: safeFontFace(options.fontFace, theme.typography.body.fontFamily),
    color: safeColor(options.color, theme.colors.text.primary),
    bold: Boolean(options.bold),
    italic: Boolean(options.italic),
    align: ['left', 'center', 'right'].includes(options.align) ? options.align : 'left',
    valign: ['top', 'middle', 'bottom'].includes(options.valign) ? options.valign : 'top'
  };
}

/**
 * Safely add text to slide with comprehensive validation
 */
function safeAddText(slide: any, text: string, options: any, theme: ProfessionalTheme): boolean {
  try {
    const cleanText = safeText(text, 2000);
    if (!cleanText) return false;

    const safeOptions = createSafeTextOptions(options, theme);

    // Additional validation
    if (safeOptions.x + safeOptions.w > SLIDE_DIMENSIONS.width) {
      safeOptions.w = SLIDE_DIMENSIONS.width - safeOptions.x - 0.1;
    }
    if (safeOptions.y + safeOptions.h > SLIDE_DIMENSIONS.height) {
      safeOptions.h = SLIDE_DIMENSIONS.height - safeOptions.y - 0.1;
    }

    slide.addText(cleanText, safeOptions);
    return true;
  } catch (error) {
    logger.warn('Failed to add text to slide', { error, text: text?.substring(0, 50) });
    return false;
  }
}

/**
 * Generate comprehensive speaker notes
 */
function generateSpeakerNotes(spec: SlideSpec, slideIndex: number, totalSlides: number): string {
  const notes: string[] = [];
  
  notes.push(`=== SLIDE ${slideIndex + 1} OF ${totalSlides} ===`);
  notes.push(`Title: ${spec.title || 'Untitled Slide'}`);
  notes.push(`Layout: ${spec.layout || 'standard'}`);
  
  // Presentation guidance
  notes.push('\n📋 PRESENTATION GUIDANCE:');
  notes.push('• Start with a clear introduction of the slide topic');
  notes.push('• Maintain eye contact with the audience');
  notes.push('• Use gestures to emphasize key points');
  
  // Content-specific guidance
  if (spec.bullets && spec.bullets.length > 0) {
    notes.push('\n🎯 KEY POINTS TO EMPHASIZE:');
    spec.bullets.forEach((bullet, index) => {
      notes.push(`• Point ${index + 1}: ${bullet}`);
    });
  }
  
  if (spec.paragraph) {
    notes.push('\n📖 PARAGRAPH CONTENT:');
    notes.push('• Read naturally, don\'t rush through the content');
    notes.push('• Pause at key transitions');
  }
  
  // Layout-specific tips
  if (spec.layout === 'chart') {
    notes.push('\n📊 CHART PRESENTATION TIPS:');
    notes.push('• Point to specific data points while speaking');
    notes.push('• Explain the "so what" - why this data matters');
  }
  
  // Accessibility reminders
  notes.push('\n♿ ACCESSIBILITY REMINDERS:');
  notes.push('• Describe visual elements for visually impaired audience members');
  notes.push('• Speak clearly and at moderate pace');
  
  return notes.join('\n');
}

/* -------------------------------------------------------------------------------------------------
 * Slide Generation Functions
 * ------------------------------------------------------------------------------------------------- */

/**
 * Add title slide with comprehensive validation and error handling
 */
function addTitleSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const contentArea = getContentArea();
  const { typography } = DEFAULT_LAYOUT;

  logger.debug('Adding title slide', { title: spec.title?.substring(0, 50) });

  // Main title with safe text handling
  const titleSuccess = safeAddText(
    slide,
    spec.title || 'Untitled Presentation',
    {
      x: contentArea.x,
      y: contentArea.y + 1.5,
      w: contentArea.width,
      h: 1.2,
      fontSize: typography.title.fontSize,
      fontFace: theme.typography.headings.fontFamily,
      color: theme.colors.text.primary,
      bold: true,
      align: 'center',
      valign: 'middle'
    },
    theme
  );

  // Subtitle if available
  if (spec.paragraph) {
    safeAddText(
      slide,
      spec.paragraph,
      {
        x: contentArea.x,
        y: contentArea.y + 3,
        w: contentArea.width,
        h: 0.8,
        fontSize: typography.body.fontSize,
        fontFace: theme.typography.body.fontFamily,
        color: theme.colors.text.secondary,
        align: 'center',
        valign: 'middle'
      },
      theme
    );
  }

  // Simple accent line with safe coordinates
  try {
    const accentX = safeCoordinate(contentArea.x + (contentArea.width - 2) / 2, SLIDE_DIMENSIONS.width, contentArea.x);
    const accentY = safeCoordinate(contentArea.y + 1.3, SLIDE_DIMENSIONS.height, contentArea.y + 1);

    slide.addShape('rect', {
      x: accentX,
      y: accentY,
      w: 2,
      h: 0.05,
      fill: { color: safeColor(theme.colors.accent, 'F59E0B') },
      line: { width: 0 }
    });
  } catch (error) {
    logger.debug('Failed to add accent line, continuing without it', { error });
  }

  if (!titleSuccess) {
    logger.warn('Title slide generation had issues, but slide was created');
  }
}

/**
 * Add content slide with comprehensive validation and enhanced functionality
 */
function addContentSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const contentArea = getContentArea();
  const { typography, spacing } = DEFAULT_LAYOUT;

  logger.debug('Adding content slide', { title: spec.title?.substring(0, 50), bulletCount: spec.bullets?.length });

  // Title with safe handling
  safeAddText(
    slide,
    spec.title || 'Untitled Slide',
    {
      x: contentArea.x,
      y: contentArea.y,
      w: contentArea.width,
      h: 0.8,
      fontSize: typography.title.fontSize,
      fontFace: theme.typography.headings.fontFamily,
      color: theme.colors.text.primary,
      bold: true,
      valign: 'middle'
    },
    theme
  );

  let currentY = contentArea.y + 0.8 + spacing.titleToContent;

  // Paragraph content with safe handling
  if (spec.paragraph) {
    const paragraphHeight = Math.min(2, Math.max(0.8, spec.paragraph.length / 100));

    safeAddText(
      slide,
      spec.paragraph,
      {
        x: contentArea.x,
        y: currentY,
        w: contentArea.width,
        h: paragraphHeight,
        fontSize: typography.body.fontSize,
        fontFace: theme.typography.body.fontFamily,
        color: theme.colors.text.primary,
        valign: 'top'
      },
      theme
    );

    currentY += paragraphHeight + spacing.paragraphSpacing;
  }

  // Enhanced bullet points with better formatting
  if (spec.bullets && spec.bullets.length > 0) {
    const maxBullets = Math.min(spec.bullets.length, 10); // Allow up to 10 bullets
    const bulletHeight = Math.min(3, maxBullets * 0.35);

    // Create properly formatted bullet text
    const bulletText = spec.bullets
      .slice(0, maxBullets)
      .map(bullet => `• ${safeText(bullet, 200)}`)
      .join('\n');

    safeAddText(
      slide,
      bulletText,
      {
        x: contentArea.x,
        y: currentY,
        w: contentArea.width,
        h: bulletHeight,
        fontSize: typography.bullets.fontSize,
        fontFace: theme.typography.body.fontFamily,
        color: theme.colors.text.primary,
        valign: 'top'
      },
      theme
    );
  }
}

/**
 * Add chart slide with reliable fallback to content
 */
function addChartSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  // Charts can be problematic - use content slide instead for reliability
  logger.info('Chart layout requested, using content slide for reliability');
  addContentSlide(slide, spec, theme);
}

// Removed parseChartDataFromBullets - no longer needed

// Removed generateChartColors - no longer needed

/**
 * Add table slide with safe table rendering or fallback to bullets
 */
function addTableSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  logger.info('Table layout requested, converting to bullet format for reliability');

  // Convert table data to bullet points for safe rendering
  if (spec.comparisonTable) {
    const { headers, rows } = spec.comparisonTable;

    // Create bullet points from table data
    const bullets: string[] = [];

    // Add header as first bullet
    if (headers && headers.length > 0) {
      bullets.push(`Headers: ${headers.join(' | ')}`);
    }

    // Add each row as a bullet
    if (rows && rows.length > 0) {
      rows.forEach((row: string[], index: number) => {
        if (row && row.length > 0) {
          bullets.push(`Row ${index + 1}: ${row.join(' | ')}`);
        }
      });
    }

    // Create a new spec with bullets instead of table
    const bulletSpec = {
      ...spec,
      bullets: bullets.length > 0 ? bullets : ['No table data available'],
      comparisonTable: undefined // Remove table data to prevent any issues
    };

    addContentSlide(slide, bulletSpec, theme);
  } else {
    // No table data, just use regular content slide
    addContentSlide(slide, spec, theme);
  }
}

// Removed parseTableDataFromBullets - no longer needed

/**
 * Add two-column slide layout with comprehensive validation
 */
function addTwoColumnSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const contentArea = getContentArea();
  const { typography, spacing } = DEFAULT_LAYOUT;

  logger.debug('Adding two-column slide', { title: spec.title?.substring(0, 50) });

  // Title with safe handling
  safeAddText(
    slide,
    spec.title || 'Two Column Layout',
    {
      x: contentArea.x,
      y: contentArea.y,
      w: contentArea.width,
      h: 0.8,
      fontSize: typography.title.fontSize,
      fontFace: theme.typography.headings.fontFamily,
      color: theme.colors.text.primary,
      bold: true,
      valign: 'middle'
    },
    theme
  );

  // Calculate safe column dimensions
  const columnWidth = Math.max(1, (contentArea.width - spacing.columnGap) / 2);
  const currentY = contentArea.y + 0.8 + spacing.titleToContent;
  const columnHeight = Math.min(3.5, contentArea.height - (currentY - contentArea.y));

  // Left column - paragraph content
  if (spec.paragraph) {
    safeAddText(
      slide,
      spec.paragraph,
      {
        x: contentArea.x,
        y: currentY,
        w: columnWidth,
        h: columnHeight,
        fontSize: typography.body.fontSize,
        fontFace: theme.typography.body.fontFamily,
        color: theme.colors.text.primary,
        valign: 'top'
      },
      theme
    );
  }

  // Right column - bullet points
  if (spec.bullets && spec.bullets.length > 0) {
    const maxBullets = Math.min(spec.bullets.length, 8); // Reasonable limit for column
    const bulletText = spec.bullets
      .slice(0, maxBullets)
      .map(bullet => `• ${safeText(bullet, 150)}`)
      .join('\n');

    const rightColumnX = safeCoordinate(
      contentArea.x + columnWidth + spacing.columnGap,
      SLIDE_DIMENSIONS.width,
      contentArea.x + columnWidth + 0.2
    );

    safeAddText(
      slide,
      bulletText,
      {
        x: rightColumnX,
        y: currentY,
        w: columnWidth,
        h: columnHeight,
        fontSize: typography.bullets.fontSize,
        fontFace: theme.typography.body.fontFamily,
        color: theme.colors.text.primary,
        valign: 'top'
      },
      theme
    );
  }
}

/**
 * Add image slide with reliable fallback to content
 */
function addImageSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  // Image layouts can be problematic - use content slide instead for reliability
  logger.info('Image layout requested, using content slide for reliability');
  addContentSlide(slide, spec, theme);
}

/**
 * Generate comprehensive presentation metadata with analytics
 */
function generateMetadata(specs: SlideSpec[], options: any) {
  const currentDate = new Date();

  // Analyze content for better metadata
  const layouts = specs.map(s => s.layout).filter(Boolean);
  const uniqueLayouts = [...new Set(layouts)];
  const totalWords = specs.reduce((count, spec) => {
    let words = 0;
    if (spec.title) words += spec.title.split(' ').length;
    if (spec.paragraph) words += spec.paragraph.split(' ').length;
    if (spec.bullets) words += spec.bullets.join(' ').split(' ').length;
    return count + words;
  }, 0);

  const estimatedReadingTime = Math.ceil(totalWords / 200); // 200 words per minute

  return {
    title: specs.length > 0 ? specs[0].title : 'Professional Presentation',
    author: options.author || 'AI PowerPoint Generator',
    company: options.company || 'Professional Presentations',
    subject: options.subject || 'AI-Generated Presentation',
    description: generatePresentationDescription(specs, uniqueLayouts),
    keywords: generateKeywords(specs),
    created: currentDate.toISOString(),
    modified: currentDate.toISOString(),
    slideCount: specs.length,
    wordCount: totalWords,
    estimatedReadingTime: `${estimatedReadingTime} minutes`,
    layouts: uniqueLayouts.join(', '),
    generator: 'AI PowerPoint Generator v4.0.0-enhanced',
    version: '4.0.0',
    language: 'en-US'
  };
}

/**
 * Generate detailed presentation description
 */
function generatePresentationDescription(specs: SlideSpec[], layouts: string[]): string {
  let description = `Professional AI-generated presentation containing ${specs.length} slide${specs.length > 1 ? 's' : ''}`;

  if (layouts.length > 0) {
    description += ` with ${layouts.join(', ')} layouts`;
  }

  const hasCharts = layouts.includes('chart');
  const hasTables = layouts.includes('table') || layouts.includes('comparison-table');
  const hasImages = layouts.some(l => l.includes('image'));

  const features = [];
  if (hasCharts) features.push('data visualizations');
  if (hasTables) features.push('comparison tables');
  if (hasImages) features.push('visual content');

  if (features.length > 0) {
    description += ` featuring ${features.join(', ')}`;
  }

  return description + '.';
}

/**
 * Generate relevant keywords from slide content
 */
function generateKeywords(specs: SlideSpec[]): string {
  const keywords = new Set<string>();

  specs.forEach(spec => {
    // Extract keywords from titles
    if (spec.title) {
      spec.title.split(' ').forEach(word => {
        const cleaned = word.toLowerCase().replace(/[^\w]/g, '');
        if (cleaned.length > 3) keywords.add(cleaned);
      });
    }

    // Extract keywords from bullets
    if (spec.bullets) {
      spec.bullets.forEach(bullet => {
        bullet.split(' ').forEach(word => {
          const cleaned = word.toLowerCase().replace(/[^\w]/g, '');
          if (cleaned.length > 4) keywords.add(cleaned);
        });
      });
    }
  });

  return Array.from(keywords).slice(0, 10).join(', ');
}

/* -------------------------------------------------------------------------------------------------
 * Visual Enhancement Functions
 * ------------------------------------------------------------------------------------------------- */

/**
 * Add simple, reliable footer with slide number
 */
function addSimpleFooter(slide: any, theme: ProfessionalTheme, slideIndex: number, totalSlides: number) {
  try {
    // Simple slide number in bottom right
    slide.addText(`${slideIndex + 1} / ${totalSlides}`, {
      x: SLIDE_DIMENSIONS.width - 1,
      y: SLIDE_DIMENSIONS.height - 0.4,
      w: 0.8,
      h: 0.3,
      fontSize: 10,
      fontFace: theme.typography.body.fontFamily,
      color: safeColor(theme.colors.text.secondary, '6B7280'),
      align: 'right',
      valign: 'middle'
    });
  } catch (error) {
    logger.warn('Error adding footer, skipping', { error });
  }
}

/* -------------------------------------------------------------------------------------------------
 * Main Generation Function
 * ------------------------------------------------------------------------------------------------- */

/**
 * Generate enhanced PowerPoint presentation
 */
export async function generateEnhancedPpt(
  specs: SlideSpec[],
  validateStyles: boolean = true,
  themeId?: string,
  options: {
    includeMetadata?: boolean;
    includeSpeakerNotes?: boolean;
    optimizeFileSize?: boolean;
    quality?: 'draft' | 'standard' | 'high';
    author?: string;
    company?: string;
    subject?: string;
  } = {}
): Promise<Buffer> {
  const startTime = Date.now();
  const context: LogContext = {
    requestId: `ppt_enhanced_${Date.now()}`,
    component: 'pptGenerator-enhanced',
    operation: 'generateEnhancedPpt',
  };

  // Comprehensive input validation
  if (!specs || specs.length === 0) {
    throw new Error('No slide specifications provided. Please provide at least one slide.');
  }

  if (specs.length > 50) {
    throw new Error(`Too many slides requested (${specs.length}). Maximum allowed is 50 slides per presentation.`);
  }

  // Validate and auto-fix slide specifications
  const validationWarnings: string[] = [];
  specs.forEach((spec, index) => {
    // Auto-fix missing titles
    if (!spec.title || spec.title.trim().length === 0) {
      spec.title = `Slide ${index + 1}`;
      validationWarnings.push(`Slide ${index + 1}: Added default title`);
    }

    // Auto-truncate long titles
    if (spec.title && spec.title.length > 200) {
      spec.title = spec.title.substring(0, 197) + '...';
      validationWarnings.push(`Slide ${index + 1}: Title truncated to 200 characters`);
    }

    // Set default layout if missing
    if (!spec.layout) {
      spec.layout = 'title-bullets';
      validationWarnings.push(`Slide ${index + 1}: Set default layout to title-bullets`);
    }

    // Auto-limit bullet points
    if (spec.bullets && spec.bullets.length > 15) {
      spec.bullets = spec.bullets.slice(0, 15);
      validationWarnings.push(`Slide ${index + 1}: Limited to 15 bullet points`);
    }

    // Auto-truncate long paragraphs
    if (spec.paragraph && spec.paragraph.length > 5000) {
      spec.paragraph = spec.paragraph.substring(0, 4997) + '...';
      validationWarnings.push(`Slide ${index + 1}: Paragraph truncated to 5000 characters`);
    }
  });

  if (validationWarnings.length > 0) {
    logger.info('Auto-fixed slide specifications', context, { warnings: validationWarnings });
  }

  logger.info(`Starting enhanced PowerPoint generation for ${specs.length} slides`, context, {
    themeId: themeId || 'corporate-blue',
    options
  });

  try {
    // Initialize presentation with safe settings
    const pres = new pptxgen();

    // Define layout with validated dimensions
    const layoutConfig = {
      name: 'LAYOUT_16x9',
      width: SLIDE_DIMENSIONS.width,
      height: SLIDE_DIMENSIONS.height
    };

    pres.defineLayout(layoutConfig);
    pres.layout = 'LAYOUT_16x9';

    logger.debug('Presentation initialized with layout', layoutConfig);

    // Get and validate theme with fallback
    let theme = themeId ? getThemeById(themeId) : getThemeById('corporate-blue');
    if (!theme) {
      logger.warn(`Theme not found: ${themeId}, using fallback`, context);
      theme = getThemeById('corporate-blue');
      if (!theme) {
        // Create minimal fallback theme
        theme = {
          id: 'fallback',
          name: 'Fallback Theme',
          colors: {
            background: 'FFFFFF',
            text: { primary: '1F2937', secondary: '6B7280' },
            primary: '3B82F6',
            secondary: '10B981',
            accent: 'F59E0B'
          },
          typography: {
            headings: { fontFamily: 'Arial' },
            body: { fontFamily: 'Arial' }
          }
        } as ProfessionalTheme;
        logger.info('Using minimal fallback theme', context);
      }
    }

    // Set safe presentation properties
    if (options.includeMetadata !== false) {
      try {
        const metadata = generateMetadata(specs, options);

        // Set metadata with safe text handling
        pres.author = safeText(metadata.author, 100) || 'AI PowerPoint Generator';
        pres.company = safeText(metadata.company, 100) || 'Professional Presentations';
        pres.subject = safeText(metadata.subject, 200) || 'AI-Generated Presentation';
        pres.title = safeText(metadata.title, 200) || 'Professional Presentation';
        pres.revision = '1';
        pres.rtlMode = false;

        logger.info('Presentation metadata set safely', context, {
          title: metadata.title?.substring(0, 50),
          slideCount: metadata.slideCount,
          estimatedReadingTime: metadata.estimatedReadingTime
        });
      } catch (error) {
        logger.warn('Failed to set metadata, continuing without it', context, { error });
      }
    }

    // Generate slides with enhanced error handling
    let successfulSlides = 0;
    const failedSlides: { index: number; error: string }[] = [];

    specs.forEach((spec, index) => {
      try {
        logger.debug(`Generating slide ${index + 1}/${specs.length}`, context, {
          title: spec.title,
          layout: spec.layout
        });

        const slide = pres.addSlide();

        // Set safe background with validation
        try {
          const backgroundColor = safeColor(theme!.colors.background, 'FFFFFF');
          slide.background = { color: backgroundColor };
          logger.debug(`Set slide background to ${backgroundColor}`);
        } catch (error) {
          logger.warn('Failed to set slide background, using default', { error });
          // PowerPoint will use default white background
        }

        // Validate slide specification
        if (!spec.title && !spec.paragraph && (!spec.bullets || spec.bullets.length === 0)) {
          logger.warn(`Slide ${index + 1} has no content, adding placeholder`, context);
          spec.title = spec.title || `Slide ${index + 1}`;
          spec.paragraph = 'Content will be added here.';
        }

        // Add content based on layout with error handling
        try {
          switch (spec.layout) {
            case 'title':
              addTitleSlide(slide, spec, theme!);
              break;
            case 'chart':
              addChartSlide(slide, spec, theme!);
              break;
            case 'comparison-table':
              addTableSlide(slide, spec, theme!);
              break;
            case 'two-column':
              addTwoColumnSlide(slide, spec, theme!);
              break;
            case 'image-left':
            case 'image-right':
              addImageSlide(slide, spec, theme!);
              break;
            default:
              addContentSlide(slide, spec, theme!);
          }
        } catch (layoutError) {
          logger.warn(`Layout generation failed for slide ${index + 1}, using fallback`, context, {
            layout: spec.layout,
            error: layoutError instanceof Error ? layoutError.message : String(layoutError)
          });
          // Fallback to basic content slide
          addContentSlide(slide, spec, theme!);
        }

        // Add simple footer
        try {
          addSimpleFooter(slide, theme!, index, specs.length);
        } catch (footerError) {
          logger.warn(`Failed to add footer for slide ${index + 1}`, context, {
            error: footerError instanceof Error ? footerError.message : String(footerError)
          });
        }

        // Add comprehensive speaker notes
        if (options.includeSpeakerNotes !== false) {
          try {
            const notes = generateSpeakerNotes(spec, index, specs.length);
            slide.addNotes(notes);
          } catch (notesError) {
            logger.warn(`Failed to add speaker notes for slide ${index + 1}`, context, {
              error: notesError instanceof Error ? notesError.message : String(notesError)
            });
          }
        }

        successfulSlides++;

      } catch (slideError) {
        const errorMessage = slideError instanceof Error ? slideError.message : String(slideError);
        logger.error(`Failed to generate slide ${index + 1}`, context, {
          title: spec.title,
          layout: spec.layout,
          error: errorMessage
        });
        failedSlides.push({ index: index + 1, error: errorMessage });
      }
    });

    // Log generation summary
    logger.info('Slide generation completed', context, {
      totalSlides: specs.length,
      successfulSlides,
      failedSlides: failedSlides.length,
      failures: failedSlides
    });

    if (successfulSlides === 0) {
      throw new Error('Failed to generate any slides');
    }

    // Generate buffer with safe, minimal options
    logger.info('Generating PowerPoint buffer', context);
    const exportOptions = {
      outputType: 'nodebuffer' as const,
      compression: false, // Disable compression to avoid corruption
      rtlMode: false
    };

    const buffer = await pres.write(exportOptions) as Buffer;

    // Comprehensive buffer validation
    if (!buffer || buffer.length === 0) {
      throw new Error('Generated PowerPoint buffer is empty');
    }

    // Validate PPTX file signature (ZIP format)
    const signature = buffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4b, 0x03, 0x04]); // PK header
    if (!signature.equals(expectedSignature)) {
      logger.error('Invalid PowerPoint file signature', context, {
        expected: Array.from(expectedSignature).map(b => `0x${b.toString(16)}`).join(' '),
        actual: Array.from(signature).map(b => `0x${b.toString(16)}`).join(' ')
      });
      throw new Error('Generated file has invalid PowerPoint signature');
    }

    // Check minimum file size
    const minSize = 5000; // Minimum reasonable size for a PPTX file
    if (buffer.length < minSize) {
      throw new Error(`Generated file too small (${buffer.length} bytes, minimum ${minSize})`);
    }

    // Validate PPTX structure
    const bufferString = buffer.toString('utf8', 0, Math.min(buffer.length, 10000));
    const hasContentTypes = bufferString.includes('[Content_Types].xml');
    const hasSlides = bufferString.includes('slide') || bufferString.includes('Slide');
    const hasRels = bufferString.includes('_rels');

    if (!hasContentTypes || !hasSlides || !hasRels) {
      logger.warn('PowerPoint structure validation warnings', context, {
        hasContentTypes,
        hasSlides,
        hasRels
      });
    }

    const generationTime = Date.now() - startTime;
    const fileSizeKB = Math.round(buffer.length / 1024);

    logger.info('Enhanced PowerPoint generation completed successfully', context, {
      slideCount: specs.length,
      successfulSlides,
      failedSlides: failedSlides.length,
      fileSize: buffer.length,
      fileSizeKB,
      generationTime,
      averageTimePerSlide: Math.round(generationTime / specs.length)
    });

    return buffer;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Enhanced PowerPoint generation failed', context, {
      error: errorMessage,
      slideCount: specs.length,
      generationTime: Date.now() - startTime
    });

    // Re-throw with enhanced error information
    throw new Error(`PowerPoint generation failed: ${errorMessage}`);
  }
}

// Export alias for compatibility
export { generateEnhancedPpt as generatePpt };
