/**
 * Professional PowerPoint Generator - Simplified & Enhanced
 * 
 * Core Features:
 * - Professional 16:9 slide layouts with modern design
 * - Enhanced typography and theme system
 * - Native chart and table support
 * - Speaker notes and metadata
 * - Optimized for maintainability and performance
 * 
 * @version 4.0.0-simplified
 * @author AI PowerPoint Generator Team
 */

import pptxgen from 'pptxgenjs';
import { SlideSpec } from './schema';
import { ProfessionalTheme, PROFESSIONAL_THEMES } from './professionalThemes';
import { logger, LogContext } from './utils/smartLogger';

/* -------------------------------------------------------------------------------------------------
 * Core Constants & Types
 * ------------------------------------------------------------------------------------------------- */

// Standard 16:9 slide dimensions (inches)
const SLIDE = { width: 10, height: 5.63 };

// Modern layout configuration with professional spacing
const LAYOUT = {
  margins: { top: 0.6, bottom: 0.5, left: 0.7, right: 0.7 },
  typography: {
    title: { fontSize: 36, lineSpacing: 42, fontWeight: 'bold' as const },
    subtitle: { fontSize: 24, lineSpacing: 30, fontWeight: 'normal' as const },
    body: { fontSize: 18, lineSpacing: 26, fontWeight: 'normal' as const },
    bullets: { fontSize: 16, lineSpacing: 24, fontWeight: 'normal' as const },
    caption: { fontSize: 12, lineSpacing: 16, fontWeight: 'normal' as const }
  },
  spacing: {
    titleToContent: 0.4,
    paragraphSpacing: 0.25,
    bulletSpacing: 0.2,
    columnGap: 0.5,
    sectionSpacing: 0.3
  }
};

// Content area calculations
const CONTENT = {
  x: LAYOUT.margins.left,
  y: LAYOUT.margins.top,
  width: SLIDE.width - LAYOUT.margins.left - LAYOUT.margins.right,
  height: SLIDE.height - LAYOUT.margins.top - LAYOUT.margins.bottom,
  titleHeight: 0.8,
  get bodyY() { return this.y + this.titleHeight + LAYOUT.spacing.titleToContent; },
  get bodyHeight() { return this.height - this.titleHeight - LAYOUT.spacing.titleToContent; }
};

/* -------------------------------------------------------------------------------------------------
 * Utility Functions
 * ------------------------------------------------------------------------------------------------- */

/**
 * Convert color input to safe 6-digit hex format for PowerPoint
 */
function safeColor(input: any, fallback = '333333'): string {
  if (!input) return fallback;
  
  const color = typeof input === 'string' ? input : 
                (input && typeof input === 'object' && input.primary) ? input.primary : '';
  
  if (!color) return fallback;
  
  // Remove # and validate hex
  const hex = color.replace('#', '');
  if (/^[0-9a-fA-F]{6}$/.test(hex)) return hex.toUpperCase();
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    const [r, g, b] = hex.split('');
    return `${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  
  return fallback;
}

/**
 * Get PowerPoint-compatible font name
 */
function getPowerPointFont(fontFamily?: string): string {
  const fontMap: Record<string, string> = {
    'Inter': 'Calibri',
    'SF Pro Display': 'Calibri', 
    'system-ui': 'Calibri',
    'Segoe UI': 'Segoe UI',
    'Arial': 'Arial',
    'Times New Roman': 'Times New Roman',
    'Helvetica': 'Helvetica'
  };
  
  if (!fontFamily) return 'Calibri';
  const first = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
  return fontMap[first] || 'Calibri';
}

/**
 * Get theme colors with safe fallbacks
 */
function getThemeColors(theme: ProfessionalTheme) {
  return {
    primary: safeColor(theme.colors.primary, '1E40AF'),
    accent: safeColor(theme.colors.accent, '3B82F6'),
    background: safeColor(theme.colors.background, 'FFFFFF'),
    surface: safeColor(theme.colors.surface, 'F8FAFC'),
    textPrimary: safeColor(theme.colors.text.primary, '1F2937'),
    textSecondary: safeColor(theme.colors.text.secondary, '6B7280'),
    textMuted: safeColor(theme.colors.text.muted, '9CA3AF')
  };
}

/**
 * Get theme fonts
 */
function getThemeFonts(theme: ProfessionalTheme) {
  return {
    heading: getPowerPointFont(theme.typography.headings.fontFamily),
    body: getPowerPointFont(theme.typography.body.fontFamily)
  };
}

/**
 * Safe text truncation with ellipsis
 */
function safeText(text: string | undefined, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format bullets for PowerPoint with proper line breaks
 */
function formatBullets(bullets: string[]): string {
  return bullets
    .filter(bullet => bullet && bullet.trim())
    .map(bullet => bullet.trim())
    .join('\n');
}

/* -------------------------------------------------------------------------------------------------
 * Design Elements
 * ------------------------------------------------------------------------------------------------- */

/**
 * Add professional header accent bar
 */
function addHeaderAccent(slide: any, theme: ProfessionalTheme) {
  const colors = getThemeColors(theme);
  
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: SLIDE.width,
    h: 0.08,
    fill: { color: colors.accent },
    line: { width: 0 }
  });
}

/**
 * Add slide number footer
 */
function addSlideNumber(slide: any, theme: ProfessionalTheme, slideIndex: number, totalSlides: number) {
  const colors = getThemeColors(theme);
  const fonts = getThemeFonts(theme);
  
  slide.addText(`${slideIndex + 1} / ${totalSlides}`, {
    x: SLIDE.width - 1.2,
    y: SLIDE.height - 0.4,
    w: 1.0,
    h: 0.3,
    fontSize: 10,
    fontFace: fonts.body,
    color: colors.textMuted,
    align: 'right',
    valign: 'middle'
  });
}

/**
 * Add professional background with subtle design elements
 */
function addProfessionalBackground(slide: any, theme: ProfessionalTheme, slideIndex: number) {
  const colors = getThemeColors(theme);
  
  // Set slide background
  slide.background = { color: colors.background };
  
  // Add header accent
  addHeaderAccent(slide, theme);
  
  // Add subtle corner element on alternating slides
  if (slideIndex % 2 === 1) {
    slide.addShape('ellipse', {
      x: SLIDE.width - 0.8,
      y: SLIDE.height - 0.8,
      w: 0.4,
      h: 0.4,
      fill: { color: colors.accent, transparency: 85 },
      line: { width: 0 }
    });
  }
}

/* -------------------------------------------------------------------------------------------------
 * Slide Layout Functions
 * ------------------------------------------------------------------------------------------------- */

/**
 * Add title slide with professional styling
 */
function addTitleSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const colors = getThemeColors(theme);
  const fonts = getThemeFonts(theme);
  
  // Main title
  slide.addText(safeText(spec.title, 120), {
    x: CONTENT.x,
    y: 1.8,
    w: CONTENT.width,
    h: 1.2,
    fontSize: 44,
    fontFace: fonts.heading,
    color: colors.primary,
    bold: true,
    align: 'center',
    valign: 'middle'
  });
  
  // Subtitle if available
  if (spec.paragraph) {
    slide.addText(safeText(spec.paragraph, 200), {
      x: CONTENT.x,
      y: 3.2,
      w: CONTENT.width,
      h: 0.8,
      fontSize: 20,
      fontFace: fonts.body,
      color: colors.textSecondary,
      align: 'center',
      valign: 'middle'
    });
  }
  
  // Decorative underline
  slide.addShape('rect', {
    x: CONTENT.x + CONTENT.width * 0.25,
    y: 4.2,
    w: CONTENT.width * 0.5,
    h: 0.04,
    fill: { color: colors.accent },
    line: { width: 0 }
  });
}

/**
 * Add content slide with title and bullets/paragraph
 */
function addContentSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const colors = getThemeColors(theme);
  const fonts = getThemeFonts(theme);

  // Title
  slide.addText(safeText(spec.title, 120), {
    x: CONTENT.x,
    y: CONTENT.y,
    w: CONTENT.width,
    h: CONTENT.titleHeight,
    fontSize: LAYOUT.typography.title.fontSize,
    fontFace: fonts.heading,
    color: colors.primary,
    bold: true,
    valign: 'middle'
  });

  // Content area
  const contentY = CONTENT.bodyY;
  const contentHeight = CONTENT.bodyHeight;

  if (spec.bullets && spec.bullets.length > 0) {
    // Bullet points
    slide.addText(formatBullets(spec.bullets), {
      x: CONTENT.x,
      y: contentY,
      w: CONTENT.width,
      h: contentHeight,
      fontSize: LAYOUT.typography.bullets.fontSize,
      fontFace: fonts.body,
      color: colors.textPrimary,
      bullet: { type: 'bullet', style: '•' },
      lineSpacing: LAYOUT.typography.bullets.lineSpacing,
      valign: 'top'
    });
  } else if (spec.paragraph) {
    // Paragraph text
    slide.addText(spec.paragraph, {
      x: CONTENT.x,
      y: contentY,
      w: CONTENT.width,
      h: contentHeight,
      fontSize: LAYOUT.typography.body.fontSize,
      fontFace: fonts.body,
      color: colors.textPrimary,
      lineSpacing: LAYOUT.typography.body.lineSpacing,
      valign: 'top'
    });
  }
}

/**
 * Add two-column slide layout
 */
function addTwoColumnSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const colors = getThemeColors(theme);
  const fonts = getThemeFonts(theme);

  // Title
  slide.addText(safeText(spec.title, 120), {
    x: CONTENT.x,
    y: CONTENT.y,
    w: CONTENT.width,
    h: CONTENT.titleHeight,
    fontSize: LAYOUT.typography.title.fontSize,
    fontFace: fonts.heading,
    color: colors.primary,
    bold: true,
    valign: 'middle'
  });

  const contentY = CONTENT.bodyY;
  const contentHeight = CONTENT.bodyHeight;
  const columnWidth = (CONTENT.width - LAYOUT.spacing.columnGap) / 2;

  // Left column
  if (spec.left?.bullets && spec.left.bullets.length > 0) {
    slide.addText(formatBullets(spec.left.bullets), {
      x: CONTENT.x,
      y: contentY,
      w: columnWidth,
      h: contentHeight,
      fontSize: LAYOUT.typography.bullets.fontSize,
      fontFace: fonts.body,
      color: colors.textPrimary,
      bullet: { type: 'bullet', style: '•' },
      lineSpacing: LAYOUT.typography.bullets.lineSpacing,
      valign: 'top'
    });
  } else if (spec.left?.paragraph) {
    slide.addText(spec.left.paragraph, {
      x: CONTENT.x,
      y: contentY,
      w: columnWidth,
      h: contentHeight,
      fontSize: LAYOUT.typography.body.fontSize,
      fontFace: fonts.body,
      color: colors.textPrimary,
      lineSpacing: LAYOUT.typography.body.lineSpacing,
      valign: 'top'
    });
  }

  // Right column
  if (spec.right?.bullets && spec.right.bullets.length > 0) {
    slide.addText(formatBullets(spec.right.bullets), {
      x: CONTENT.x + columnWidth + LAYOUT.spacing.columnGap,
      y: contentY,
      w: columnWidth,
      h: contentHeight,
      fontSize: LAYOUT.typography.bullets.fontSize,
      fontFace: fonts.body,
      color: colors.textPrimary,
      bullet: { type: 'bullet', style: '•' },
      lineSpacing: LAYOUT.typography.bullets.lineSpacing,
      valign: 'top'
    });
  } else if (spec.right?.paragraph) {
    slide.addText(spec.right.paragraph, {
      x: CONTENT.x + columnWidth + LAYOUT.spacing.columnGap,
      y: contentY,
      w: columnWidth,
      h: contentHeight,
      fontSize: LAYOUT.typography.body.fontSize,
      fontFace: fonts.body,
      color: colors.textPrimary,
      lineSpacing: LAYOUT.typography.body.lineSpacing,
      valign: 'top'
    });
  }

  // Column divider
  slide.addShape('rect', {
    x: CONTENT.x + columnWidth + LAYOUT.spacing.columnGap / 2 - 0.02,
    y: contentY,
    w: 0.04,
    h: contentHeight * 0.8,
    fill: { color: colors.accent, transparency: 70 },
    line: { width: 0 }
  });
}

/**
 * Add chart slide with native PowerPoint charts
 */
function addChartSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const colors = getThemeColors(theme);
  const fonts = getThemeFonts(theme);

  // Title
  slide.addText(safeText(spec.title, 120), {
    x: CONTENT.x,
    y: CONTENT.y,
    w: CONTENT.width,
    h: CONTENT.titleHeight,
    fontSize: LAYOUT.typography.title.fontSize,
    fontFace: fonts.heading,
    color: colors.primary,
    bold: true,
    valign: 'middle'
  });

  // Chart data from bullets or chart property
  if (spec.chart) {
    const chartData = spec.chart.series.map(series => ({
      name: series.name,
      labels: spec.chart!.categories,
      values: series.data
    }));

    slide.addChart('bar', chartData, {
      x: CONTENT.x,
      y: CONTENT.bodyY,
      w: CONTENT.width,
      h: CONTENT.bodyHeight,
      title: spec.chart.title || spec.title,
      showTitle: true,
      showLegend: chartData.length > 1,
      showValue: true,
      chartColors: [colors.primary, colors.accent, colors.textSecondary]
    });
  } else if (spec.bullets && spec.bullets.length > 0) {
    // Parse chart data from bullets
    const chartData = parseChartDataFromBullets(spec.bullets);
    if (chartData.length > 0) {
      slide.addChart('column', chartData, {
        x: CONTENT.x,
        y: CONTENT.bodyY,
        w: CONTENT.width,
        h: CONTENT.bodyHeight,
        title: spec.title,
        showTitle: true,
        showLegend: false,
        showValue: true,
        chartColors: [colors.primary, colors.accent]
      });
    }
  }
}

/**
 * Add table slide with professional styling
 */
function addTableSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const colors = getThemeColors(theme);
  const fonts = getThemeFonts(theme);

  // Title
  slide.addText(safeText(spec.title, 120), {
    x: CONTENT.x,
    y: CONTENT.y,
    w: CONTENT.width,
    h: CONTENT.titleHeight,
    fontSize: LAYOUT.typography.title.fontSize,
    fontFace: fonts.heading,
    color: colors.primary,
    bold: true,
    valign: 'middle'
  });

  // Table data
  if (spec.comparisonTable && spec.comparisonTable.rows) {
    const tableData = [
      spec.comparisonTable.headers || ['Item', 'Details'],
      ...spec.comparisonTable.rows
    ];

    slide.addTable(tableData, {
      x: CONTENT.x,
      y: CONTENT.bodyY,
      w: CONTENT.width,
      h: CONTENT.bodyHeight,
      fontSize: 14,
      fontFace: fonts.body,
      color: colors.textPrimary,
      fill: { color: colors.surface },
      border: { pt: 1, color: colors.textMuted },
      rowH: 0.4,
      colW: CONTENT.width / (tableData[0]?.length || 2)
    });
  } else if (spec.bullets && spec.bullets.length > 0) {
    // Create simple table from bullets
    const tableData = [
      ['Feature', 'Description'],
      ...spec.bullets.map(bullet => {
        const parts = bullet.split(':');
        return parts.length > 1 ? [parts[0].trim(), parts[1].trim()] : [bullet, ''];
      })
    ];

    slide.addTable(tableData, {
      x: CONTENT.x,
      y: CONTENT.bodyY,
      w: CONTENT.width,
      h: CONTENT.bodyHeight,
      fontSize: 14,
      fontFace: fonts.body,
      color: colors.textPrimary,
      fill: { color: colors.surface },
      border: { pt: 1, color: colors.textMuted },
      rowH: 0.4,
      colW: [CONTENT.width * 0.3, CONTENT.width * 0.7]
    });
  }
}

/* -------------------------------------------------------------------------------------------------
 * Data Parsing Utilities
 * ------------------------------------------------------------------------------------------------- */

/**
 * Parse chart data from bullet points
 */
function parseChartDataFromBullets(bullets: string[]): any[] {
  const chartData: any[] = [];
  const labels: string[] = [];
  const values: number[] = [];

  bullets.forEach(bullet => {
    // Look for patterns like "Item: 25" or "Item - 25%" or "Item (25)"
    const matches = bullet.match(/^([^:(-]+)[:(-]\s*(\d+(?:\.\d+)?)\s*[%)]*$/);
    if (matches) {
      labels.push(matches[1].trim());
      values.push(parseFloat(matches[2]));
    }
  });

  if (labels.length > 0 && values.length > 0) {
    chartData.push({
      name: 'Data',
      labels,
      values
    });
  }

  return chartData;
}

/**
 * Generate comprehensive metadata for the presentation
 */
function generateMetadata(specs: SlideSpec[], options: any = {}) {
  const currentDate = new Date();
  const totalWords = specs.reduce((count, spec) => {
    let words = (spec.title?.split(' ').length || 0);
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
    created: currentDate.toISOString(),
    modified: currentDate.toISOString(),
    slideCount: specs.length,
    wordCount: totalWords,
    estimatedReadingTime: `${estimatedReadingTime} minutes`,
    generator: 'AI PowerPoint Generator v4.0.0-simplified',
    version: '4.0.0-simplified'
  };
}

/* -------------------------------------------------------------------------------------------------
 * Main Generation Function
 * ------------------------------------------------------------------------------------------------- */

/**
 * Generate simplified PowerPoint presentation with professional design
 */
export async function generateSimplePpt(
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
    requestId: `ppt_simple_${Date.now()}`,
    component: 'pptGenerator-simple',
    operation: 'generateSimplePpt'
  };

  // Input validation
  if (!specs || specs.length === 0) {
    throw new Error('No slide specifications provided');
  }

  logger.info(`Starting simplified PowerPoint generation for ${specs.length} slides`, context, {
    themeId: themeId || 'corporate-blue',
    options
  });

  try {
    // Initialize presentation
    const pres = new pptxgen();

    // Set 16:9 layout
    pres.defineLayout({
      name: 'LAYOUT_16x9',
      width: SLIDE.width,
      height: SLIDE.height
    });
    pres.layout = 'LAYOUT_16x9';

    // Get theme
    const theme = PROFESSIONAL_THEMES.find(t => t.id === themeId) || PROFESSIONAL_THEMES[0];

    // Set presentation metadata
    if (options.includeMetadata !== false) {
      const metadata = generateMetadata(specs, options);
      pres.author = metadata.author;
      pres.company = metadata.company;
      pres.subject = metadata.subject;
      pres.title = metadata.title;
      pres.revision = '1';
    }

    // Generate slides
    specs.forEach((spec, index) => {
      try {
        logger.debug(`Generating slide ${index + 1}/${specs.length}`, context, {
          title: spec.title,
          layout: spec.layout
        });

        const slide = pres.addSlide();

        // Add professional background and design elements
        addProfessionalBackground(slide, theme, index);

        // Add content based on layout
        switch (spec.layout) {
          case 'title':
            addTitleSlide(slide, spec, theme);
            break;
          case 'chart':
            addChartSlide(slide, spec, theme);
            break;
          case 'comparison-table':
            addTableSlide(slide, spec, theme);
            break;
          case 'two-column':
            addTwoColumnSlide(slide, spec, theme);
            break;
          default:
            addContentSlide(slide, spec, theme);
        }

        // Add speaker notes if enabled
        if (options.includeSpeakerNotes && spec.notes) {
          slide.addNotes(spec.notes);
        }

        // Add slide number
        addSlideNumber(slide, theme, index, specs.length);

      } catch (slideError) {
        logger.warn(`Failed to generate slide ${index + 1}, using fallback`, context, {
          error: slideError instanceof Error ? slideError.message : String(slideError)
        });

        // Fallback to basic content slide
        const slide = pres.addSlide();
        addProfessionalBackground(slide, theme, index);
        addContentSlide(slide, spec, theme);
        addSlideNumber(slide, theme, index, specs.length);
      }
    });

    // Generate buffer
    logger.info('Generating PowerPoint buffer', context);
    const buffer = await pres.write({
      outputType: 'nodebuffer',
      compression: false
    }) as Buffer;

    // Validate buffer
    if (!buffer || buffer.length === 0) {
      throw new Error('Generated PowerPoint buffer is empty');
    }

    if (buffer.length < 10000) {
      logger.warn('PowerPoint file is suspiciously small', context, {
        bufferSize: buffer.length
      });
    }

    const generationTime = Date.now() - startTime;
    logger.info('PowerPoint generation completed successfully', context, {
      slideCount: specs.length,
      bufferSize: buffer.length,
      generationTime: `${generationTime}ms`
    });

    return buffer;

  } catch (error) {
    logger.error('PowerPoint generation failed', context, {
      error: error instanceof Error ? error.message : String(error),
      slideCount: specs.length
    });
    throw error;
  }
}

// Export alias for compatibility
export const generatePpt = generateSimplePpt;
