/**
 * Professional PowerPoint Generator - Enhanced & Simplified
 *
 * Core Features:
 * - Professional 16:9 slide layouts with modern design aesthetics
 * - Enhanced typography system with PowerPoint-optimized fonts
 * - Native chart and table support with theme-consistent styling
 * - Comprehensive speaker notes and metadata generation
 * - Advanced error handling and performance optimization
 * - AI-agent-friendly code structure with extensive documentation
 *
 * Key Improvements:
 * - Simplified code structure for better maintainability
 * - Enhanced visual design with professional styling
 * - Robust error handling with graceful fallbacks
 * - Optimized for scalability and performance
 *
 * @version 5.0.0-enhanced
 * @author AI PowerPoint Generator Team
 */

import pptxgen from 'pptxgenjs';
import { SlideSpec } from './schema';
import { ProfessionalTheme, PROFESSIONAL_THEMES } from './professionalThemes';
import { logger, LogContext } from './utils/smartLogger';

/* -------------------------------------------------------------------------------------------------
 * Core Constants & Types
 * ------------------------------------------------------------------------------------------------- */

// Standard 16:9 slide dimensions (inches) - optimized for modern displays
const SLIDE = { width: 10, height: 5.63 };

// Enhanced layout configuration with professional spacing and modern design principles
const LAYOUT = {
  // Professional margins with balanced whitespace
  margins: { top: 0.6, bottom: 0.5, left: 0.7, right: 0.7 },

  // Typography system optimized for readability and visual hierarchy
  typography: {
    title: { fontSize: 36, lineSpacing: 42, fontWeight: 'bold' as const },
    subtitle: { fontSize: 24, lineSpacing: 30, fontWeight: 'normal' as const },
    body: { fontSize: 18, lineSpacing: 26, fontWeight: 'normal' as const },
    bullets: { fontSize: 16, lineSpacing: 24, fontWeight: 'normal' as const },
    caption: { fontSize: 12, lineSpacing: 16, fontWeight: 'normal' as const }
  },

  // Spacing system for consistent visual rhythm
  spacing: {
    titleToContent: 0.4,
    paragraphSpacing: 0.25,
    bulletSpacing: 0.2,
    columnGap: 0.5,
    sectionSpacing: 0.3
  }
};

// Content area calculations with dynamic layout support
const CONTENT = {
  x: LAYOUT.margins.left,
  y: LAYOUT.margins.top,
  width: SLIDE.width - LAYOUT.margins.left - LAYOUT.margins.right,
  height: SLIDE.height - LAYOUT.margins.top - LAYOUT.margins.bottom,
  titleHeight: 0.8,
  get bodyY() { return this.y + this.titleHeight + LAYOUT.spacing.titleToContent; },
  get bodyHeight() { return this.height - this.titleHeight - LAYOUT.spacing.titleToContent; },

  // Two-column layout calculations
  get columnWidth() { return (this.width - LAYOUT.spacing.columnGap) / 2; },
  get leftColumnX() { return this.x; },
  get rightColumnX() { return this.x + this.columnWidth + LAYOUT.spacing.columnGap; }
};

/* -------------------------------------------------------------------------------------------------
 * Utility Functions
 * ------------------------------------------------------------------------------------------------- */

/**
 * Convert color input to safe 6-digit hex format for PowerPoint
 * Enhanced with better validation and error handling
 */
function safeColor(input: any, fallback = '333333'): string {
  if (!input) return fallback;

  try {
    const color = typeof input === 'string' ? input :
                  (input && typeof input === 'object' && input.primary) ? input.primary : '';

    if (!color) return fallback;

    // Remove # and validate hex
    const hex = color.replace('#', '').trim();
    if (/^[0-9a-fA-F]{6}$/.test(hex)) return hex.toUpperCase();
    if (/^[0-9a-fA-F]{3}$/.test(hex)) {
      const [r, g, b] = hex.split('');
      return `${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }

    return fallback;
  } catch (error) {
    logger.warn('Color conversion failed, using fallback', { input, fallback, error });
    return fallback;
  }
}

/**
 * Get PowerPoint-compatible font name with enhanced mapping
 * Ensures professional typography across different systems
 */
function getPowerPointFont(fontFamily?: string): string {
  const fontMap: Record<string, string> = {
    // Modern system fonts mapped to PowerPoint equivalents
    'Inter': 'Calibri',
    'SF Pro Display': 'Calibri',
    'system-ui': 'Calibri',
    'Segoe UI': 'Segoe UI',
    'Arial': 'Arial',
    'Times New Roman': 'Times New Roman',
    'Helvetica': 'Helvetica',
    'Georgia': 'Georgia',
    'Verdana': 'Verdana',
    'Tahoma': 'Tahoma',
    // Fallback for common web fonts
    'Roboto': 'Calibri',
    'Open Sans': 'Calibri',
    'Lato': 'Calibri'
  };

  if (!fontFamily) return 'Calibri';

  try {
    const first = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
    return fontMap[first] || 'Calibri';
  } catch (error) {
    logger.warn('Font mapping failed, using Calibri', { fontFamily, error });
    return 'Calibri';
  }
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
 * Enhanced safe text processing with sanitization and smart truncation
 * Ensures PowerPoint compatibility and prevents rendering issues
 */
function safeText(text: string | undefined, maxLength: number): string {
  if (!text) return '';

  try {
    // Enhanced sanitization for PowerPoint compatibility
    const cleaned = text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[""]/g, '"') // Normalize quotes
      .replace(/['']/g, "'") // Normalize apostrophes
      .replace(/[–—]/g, '-') // Normalize dashes
      .trim();

    if (cleaned.length <= maxLength) return cleaned;

    // Smart truncation with word boundary detection
    const truncated = cleaned.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > maxLength * 0.8 ? truncated.substring(0, lastSpace) : truncated) + '...';
  } catch (error) {
    logger.warn('Text sanitization failed', { text: text?.substring(0, 50), error });
    return text?.substring(0, maxLength) || '';
  }
}

/**
 * Enhanced bullet point formatting with better structure and validation
 */
function formatBullets(bullets: string[]): string {
  if (!bullets || bullets.length === 0) return '';

  try {
    return bullets
      .filter(bullet => bullet && bullet.trim().length > 0)
      .map(bullet => safeText(bullet.trim(), 200))
      .join('\n');
  } catch (error) {
    logger.warn('Bullet formatting failed', { bullets, error });
    return bullets.join('\n');
  }
}

/**
 * Advanced chart data parsing from bullet points with multiple pattern recognition
 * Supports various data formats and chart types for professional presentations
 */
function parseChartDataFromBullets(bullets: string[]): any[] {
  if (!bullets || bullets.length === 0) return [];

  try {
    const labels: string[] = [];
    const values: number[] = [];
    const categories: string[] = [];

    bullets.forEach(bullet => {
      // Enhanced pattern matching for various data formats
      const patterns = [
        // "Category: 25%" or "Category: 25.5%"
        /^(.+?):\s*(\d+(?:\.\d+)?)%/,
        // "Item - 100" or "Item – 100.5"
        /^(.+?)[-–—]\s*(\d+(?:\.\d+)?)/,
        // "Category (25)" or "Category (25.5)"
        /^(.+?)\s*\((\d+(?:\.\d+)?)\)/,
        // "25% Category" or "25.5% Category"
        /^(\d+(?:\.\d+)?)%\s+(.+)/,
        // "100 - Category" or "100.5 - Category"
        /^(\d+(?:\.\d+)?)[-–—]\s*(.+)/,
        // "Category = 25" or "Category = 25.5"
        /^(.+?)\s*=\s*(\d+(?:\.\d+)?)/,
        // "Category | 25" or "Category | 25.5"
        /^(.+?)\s*\|\s*(\d+(?:\.\d+)?)/
      ];

      let matched = false;

      for (const pattern of patterns) {
        const match = bullet.match(pattern);
        if (match) {
          let label: string;
          let value: number;

          // Handle different pattern groups
          if (pattern.source.includes('%)%')) {
            // Percentage first patterns
            value = parseFloat(match[1]);
            label = match[2].trim();
          } else {
            // Label first patterns
            label = match[1].trim();
            value = parseFloat(match[2]);
          }

          if (!isNaN(value) && label.length > 0) {
            labels.push(safeText(label, 50));
            values.push(value);
            matched = true;
            break;
          }
        }
      }

      // If no numeric pattern found, check for categorical data
      if (!matched && bullet.includes(':')) {
        const parts = bullet.split(':');
        if (parts.length === 2) {
          const category = safeText(parts[0].trim(), 50);
          const description = safeText(parts[1].trim(), 100);
          if (category && description) {
            categories.push(`${category}: ${description}`);
          }
        }
      }
    });

    // Return structured chart data
    if (labels.length > 0 && values.length > 0) {
      return [{
        name: 'Data Series',
        labels: labels,
        values: values
      }];
    }

    // If no numeric data but have categories, return empty for fallback handling
    return [];

  } catch (error) {
    logger.warn('Advanced chart data parsing failed', { bullets, error });
    return [];
  }
}

/**
 * Determine optimal chart type based on data characteristics
 */
function determineOptimalChartType(data: any[], preferredType?: string): string {
  if (preferredType && ['bar', 'column', 'line', 'pie', 'doughnut'].includes(preferredType)) {
    return preferredType;
  }

  if (!data || data.length === 0) return 'column';

  const firstSeries = data[0];
  if (!firstSeries || !firstSeries.values) return 'column';

  const valueCount = firstSeries.values.length;
  const hasMultipleSeries = data.length > 1;

  // Decision logic for optimal chart type
  if (valueCount <= 6 && !hasMultipleSeries) {
    // Few data points, single series - pie chart works well
    return 'pie';
  } else if (hasMultipleSeries) {
    // Multiple series - column chart for comparison
    return 'column';
  } else if (valueCount > 10) {
    // Many data points - line chart for trends
    return 'line';
  } else {
    // Default to column chart
    return 'column';
  }
}

/**
 * Create enhanced chart configuration with professional styling
 */
function createChartConfig(chartType: string, data: any[], colors: any, fonts: any, title: string) {
  const baseConfig = {
    title: safeText(title, 100),
    showTitle: true,
    showLegend: data.length > 1,
    showValue: true,
    chartColors: colors,
    titleFontSize: 16,
    titleFontFace: fonts.heading,
    titleColor: colors[0],
    legendFontSize: 12,
    legendFontFace: fonts.body,
    dataLabelFontSize: 11,
    dataLabelFontFace: fonts.body,
    // Enhanced styling options
    border: { pt: 1, color: colors[0] },
    plotArea: {
      fill: { color: 'FFFFFF' },
      border: { pt: 1, color: 'E5E7EB' }
    }
  };

  // Chart-specific configurations
  switch (chartType) {
    case 'bar':
    case 'column':
      return {
        ...baseConfig,
        barDir: chartType === 'bar' ? 'bar' : 'col',
        barGrouping: 'clustered',
        showValue: true,
        dataLabelPosition: 'outEnd'
      };

    case 'pie':
    case 'doughnut':
      return {
        ...baseConfig,
        showLegend: true,
        legendPos: 'r',
        dataLabelPosition: 'bestFit',
        showPercent: true
      };

    case 'line':
      return {
        ...baseConfig,
        lineSmooth: true,
        lineSize: 3,
        showMarkers: true,
        markerSize: 6
      };

    default:
      return baseConfig;
  }
}

/**
 * Create advanced table configuration with professional styling
 */
function createAdvancedTableConfig(data: string[][], colors: any, fonts: any) {
  const rowCount = data.length;
  const colCount = data[0]?.length || 0;

  return {
    fontSize: 14,
    fontFace: fonts.body,
    color: colors.textPrimary,
    fill: { color: colors.surface },
    border: { pt: 1, color: colors.textMuted },
    rowH: Math.max(0.4, Math.min(0.8, (CONTENT.bodyHeight * 0.8) / rowCount)),
    colW: Array(colCount).fill(CONTENT.width / colCount),
    margin: 0.1,
    autoFit: true,
    // Enhanced styling for different row types
    rowOptions: [
      // Header row
      {
        fill: { color: colors.primary },
        color: colors.background,
        fontFace: fonts.heading,
        bold: true,
        fontSize: 15
      },
      // Alternating row colors for better readability
      ...Array(rowCount - 1).fill(null).map((_, index) => ({
        fill: { color: index % 2 === 0 ? colors.surface : colors.background },
        color: colors.textPrimary
      }))
    ]
  };
}

/**
 * Parse and structure table data from various input formats
 */
function parseTableData(spec: SlideSpec): string[][] | null {
  try {
    // Priority 1: Structured comparison table
    if (spec.comparisonTable && spec.comparisonTable.rows) {
      const headers = spec.comparisonTable.headers || ['Item', 'Details'];
      return [
        headers.map(header => safeText(header, 50)),
        ...spec.comparisonTable.rows.map(row =>
          row.map(cell => safeText(cell, 100))
        )
      ];
    }

    // Priority 2: Parse from bullets
    if (spec.bullets && spec.bullets.length > 0) {
      const tableData: string[][] = [['Feature', 'Description']];

      spec.bullets.forEach(bullet => {
        const separators = [':', ' - ', ' – ', ' — ', ' | ', ' = '];
        let parsed = false;

        for (const separator of separators) {
          const index = bullet.indexOf(separator);
          if (index > 0) {
            const key = safeText(bullet.substring(0, index).trim(), 50);
            const value = safeText(bullet.substring(index + separator.length).trim(), 150);
            if (key && value) {
              tableData.push([key, value]);
              parsed = true;
              break;
            }
          }
        }

        // If no separator found, add as single-column entry
        if (!parsed && bullet.trim()) {
          tableData.push([safeText(bullet.trim(), 50), '']);
        }
      });

      return tableData.length > 1 ? tableData : null;
    }

    return null;
  } catch (error) {
    logger.warn('Table data parsing failed', { error });
    return null;
  }
}

/* -------------------------------------------------------------------------------------------------
 * Design Elements
 * ------------------------------------------------------------------------------------------------- */

/**
 * Add enhanced professional header accent with modern styling
 */
function addHeaderAccent(slide: any, theme: ProfessionalTheme) {
  const colors = getThemeColors(theme);

  try {
    // Modern gradient header accent for certain themes
    if (theme.id.includes('gradient') || theme.id.includes('modern') || theme.id.includes('tech')) {
      slide.addShape('rect', {
        x: 0,
        y: 0,
        w: SLIDE.width,
        h: 0.12,
        fill: {
          type: 'gradient',
          angle: 90,
          colors: [
            { color: colors.primary, position: 0 },
            { color: colors.accent, position: 100 }
          ]
        },
        line: { width: 0 }
      });
    } else {
      // Classic solid header accent
      slide.addShape('rect', {
        x: 0,
        y: 0,
        w: SLIDE.width,
        h: 0.08,
        fill: { color: colors.accent },
        line: { width: 0 }
      });
    }

    // Add subtle shadow effect for depth
    slide.addShape('rect', {
      x: 0,
      y: theme.id.includes('gradient') ? 0.12 : 0.08,
      w: SLIDE.width,
      h: 0.02,
      fill: { color: colors.primary, transparency: 90 },
      line: { width: 0 }
    });

  } catch (error) {
    logger.warn('Header accent failed, using simple fallback', { error });
    // Simple fallback
    slide.addShape('rect', {
      x: 0,
      y: 0,
      w: SLIDE.width,
      h: 0.08,
      fill: { color: colors.accent },
      line: { width: 0 }
    });
  }
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
 * Add enhanced professional background with modern design elements
 */
function addProfessionalBackground(slide: any, theme: ProfessionalTheme, slideIndex: number) {
  const colors = getThemeColors(theme);

  try {
    // Set slide background with gradient if theme supports it
    if (theme.id.includes('gradient') || theme.id.includes('modern')) {
      // Add subtle gradient background
      slide.addShape('rect', {
        x: 0,
        y: 0,
        w: SLIDE.width,
        h: SLIDE.height,
        fill: {
          type: 'gradient',
          angle: 45,
          colors: [
            { color: colors.background, position: 0 },
            { color: colors.surface, position: 100 }
          ]
        },
        line: { width: 0 }
      });
    } else {
      // Standard solid background
      slide.background = { color: colors.background };
    }

    // Add enhanced header accent with modern styling
    addHeaderAccent(slide, theme);

    // Add sophisticated design elements based on slide position
    if (slideIndex === 0) {
      // Title slide gets special treatment
      addTitleSlideDesignElements(slide, theme);
    } else {
      // Content slides get subtle accents
      addContentSlideDesignElements(slide, theme, slideIndex);
    }

  } catch (error) {
    logger.warn('Background design failed, using fallback', { slideIndex, error });
    // Fallback: simple background
    slide.background = { color: colors.background };
    addHeaderAccent(slide, theme);
  }
}

/**
 * Add special design elements for title slides
 */
function addTitleSlideDesignElements(slide: any, theme: ProfessionalTheme) {
  const colors = getThemeColors(theme);

  // Large decorative element in bottom right
  slide.addShape('ellipse', {
    x: SLIDE.width - 1.5,
    y: SLIDE.height - 1.5,
    w: 1.2,
    h: 1.2,
    fill: { color: colors.accent, transparency: 90 },
    line: { width: 0 }
  });

  // Smaller accent circle
  slide.addShape('ellipse', {
    x: SLIDE.width - 2.2,
    y: SLIDE.height - 2.2,
    w: 0.6,
    h: 0.6,
    fill: { color: colors.primary, transparency: 80 },
    line: { width: 0 }
  });
}

/**
 * Add design elements for content slides
 */
function addContentSlideDesignElements(slide: any, theme: ProfessionalTheme, slideIndex: number) {
  const colors = getThemeColors(theme);

  // Alternating design elements for visual variety
  if (slideIndex % 3 === 1) {
    // Subtle corner accent
    slide.addShape('rect', {
      x: SLIDE.width - 0.3,
      y: 0,
      w: 0.3,
      h: 1.5,
      fill: { color: colors.accent, transparency: 85 },
      line: { width: 0 }
    });
  } else if (slideIndex % 3 === 2) {
    // Bottom accent line
    slide.addShape('rect', {
      x: 0,
      y: SLIDE.height - 0.1,
      w: SLIDE.width * 0.6,
      h: 0.1,
      fill: { color: colors.primary, transparency: 70 },
      line: { width: 0 }
    });
  } else {
    // Minimal dot accent
    slide.addShape('ellipse', {
      x: SLIDE.width - 0.4,
      y: SLIDE.height - 0.4,
      w: 0.2,
      h: 0.2,
      fill: { color: colors.accent, transparency: 60 },
      line: { width: 0 }
    });
  }
}

/* -------------------------------------------------------------------------------------------------
 * Slide Generation Functions
 *
 * This section contains specialized functions for generating different types of slides:
 * - Title slides with enhanced visual design and modern typography
 * - Content slides with bullet points and structured text formatting
 * - Chart slides with native PowerPoint charts and data visualization
 * - Table slides with professional formatting and alternating row colors
 * - Two-column layouts for comparative content presentation
 * - Image slides with proper aspect ratio handling and captions
 *
 * Each function follows a consistent pattern:
 * 1. Extract theme colors and fonts for consistent styling
 * 2. Add title with professional typography and spacing
 * 3. Add content based on slide type with appropriate formatting
 * 4. Apply theme-consistent design elements and visual hierarchy
 * 5. Handle errors gracefully with fallback content and logging
 *
 * All functions are designed to be:
 * - AI-agent friendly with clear parameter types and documentation
 * - Maintainable with consistent code structure and error handling
 * - Scalable with modular design and reusable components
 * - Professional with modern design principles and accessibility
 * ------------------------------------------------------------------------------------------------- */

/**
 * Add enhanced title slide with professional styling and modern design
 *
 * Creates a visually appealing title slide with:
 * - Large, bold title with shadow effects for impact
 * - Optional subtitle with complementary styling
 * - Decorative underline accent in theme colors
 * - Subtle background design elements for visual interest
 * - Responsive layout that works across different content lengths
 *
 * @param slide - PowerPoint slide object to add content to
 * @param spec - Slide specification containing title and optional paragraph
 * @param theme - Professional theme for consistent styling
 */
function addTitleSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const colors = getThemeColors(theme);
  const fonts = getThemeFonts(theme);

  try {
    // Main title with enhanced typography
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
      valign: 'middle',
      shadow: {
        type: 'outer',
        blur: 3,
        offset: 2,
        angle: 45,
        color: '00000020'
      }
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

    // Enhanced decorative underline with gradient effect
    slide.addShape('rect', {
      x: CONTENT.x + CONTENT.width * 0.25,
      y: 4.2,
      w: CONTENT.width * 0.5,
      h: 0.04,
      fill: { color: colors.accent },
      line: { width: 0 }
    });

    // Add subtle background accent shapes for visual interest
    slide.addShape('ellipse', {
      x: SLIDE.width - 1.5,
      y: SLIDE.height - 1.5,
      w: 1.0,
      h: 1.0,
      fill: { color: colors.accent, transparency: 90 },
      line: { width: 0 }
    });

  } catch (error) {
    logger.warn('Title slide generation failed, using fallback', { error });
    // Fallback: simple title
    slide.addText(safeText(spec.title || 'Presentation', 120), {
      x: CONTENT.x,
      y: 2.5,
      w: CONTENT.width,
      h: 0.8,
      fontSize: 36,
      fontFace: fonts.heading,
      color: colors.primary,
      bold: true,
      align: 'center',
      valign: 'middle'
    });
  }
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
 * Add enhanced chart slide with native PowerPoint charts and professional styling
 */
function addChartSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const colors = getThemeColors(theme);
  const fonts = getThemeFonts(theme);

  try {
    // Title with enhanced styling
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

    // Enhanced chart colors for better visual appeal
    const chartColors = [
      colors.primary,
      colors.accent,
      colors.textSecondary,
      safeColor(theme.colors.semantic.success, '10B981'),
      safeColor(theme.colors.semantic.warning, 'F59E0B'),
      safeColor(theme.colors.semantic.info, '3B82F6')
    ];

    // Chart data from structured chart property
    if (spec.chart) {
      const chartData = spec.chart.series.map(series => ({
        name: safeText(series.name, 50),
        labels: spec.chart!.categories.map(cat => safeText(cat, 30)),
        values: series.data
      }));

      // Determine best chart type based on data
      const chartType = determineOptimalChartType(chartData, spec.chart.type || 'bar');
      const chartConfig = createChartConfig(chartType, chartData, chartColors, fonts, spec.chart.title || spec.title);

      slide.addChart(chartType, chartData, {
        x: CONTENT.x,
        y: CONTENT.bodyY,
        w: CONTENT.width,
        h: CONTENT.bodyHeight,
        ...chartConfig
      });
    } else if (spec.bullets && spec.bullets.length > 0) {
      // Parse chart data from bullets with enhanced parsing
      const chartData = parseChartDataFromBullets(spec.bullets);
      if (chartData.length > 0) {
        // Determine optimal chart type for bullet-derived data
        const chartType = determineOptimalChartType(chartData, 'column');
        const chartConfig = createChartConfig(chartType, chartData, chartColors, fonts, spec.title);

        slide.addChart(chartType, chartData, {
          x: CONTENT.x,
          y: CONTENT.bodyY,
          w: CONTENT.width,
          h: CONTENT.bodyHeight,
          ...chartConfig
        });
      } else {
        // Fallback: show bullets if no chart data found
        slide.addText(formatBullets(spec.bullets), {
          x: CONTENT.x,
          y: CONTENT.bodyY,
          w: CONTENT.width,
          h: CONTENT.bodyHeight,
          fontSize: LAYOUT.typography.bullets.fontSize,
          fontFace: fonts.body,
          color: colors.textPrimary,
          bullet: { type: 'bullet', style: '•' },
          lineSpacing: LAYOUT.typography.bullets.lineSpacing,
          valign: 'top'
        });
      }
    }
  } catch (error) {
    logger.warn('Chart slide generation failed, using fallback', { error });
    // Fallback: simple content slide
    slide.addText(safeText(spec.title || 'Chart', 120), {
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
  }
}

/**
 * Add enhanced table slide with professional styling and modern design
 */
function addTableSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const colors = getThemeColors(theme);
  const fonts = getThemeFonts(theme);

  try {
    // Title with enhanced styling
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

    // Parse and create enhanced table with advanced configuration
    const tableData = parseTableData(spec);

    if (tableData && tableData.length > 1) {
      const tableConfig = createAdvancedTableConfig(tableData, colors, fonts);

      slide.addTable(tableData, {
        x: CONTENT.x,
        y: CONTENT.bodyY,
        w: CONTENT.width,
        h: CONTENT.bodyHeight,
        ...tableConfig
      });
    } else {
      // No table data available, show informational message
      slide.addText('No table data available for this slide.', {
        x: CONTENT.x,
        y: CONTENT.bodyY,
        w: CONTENT.width,
        h: CONTENT.bodyHeight,
        fontSize: LAYOUT.typography.body.fontSize,
        fontFace: fonts.body,
        color: colors.textSecondary,
        align: 'center',
        valign: 'middle',
        italic: true
      });
    }
  } catch (error) {
    logger.warn('Table slide generation failed, using fallback', { error });
    // Fallback: simple bullet list
    slide.addText(safeText(spec.title || 'Table', 120), {
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

    if (spec.bullets) {
      slide.addText(formatBullets(spec.bullets), {
        x: CONTENT.x,
        y: CONTENT.bodyY,
        w: CONTENT.width,
        h: CONTENT.bodyHeight,
        fontSize: LAYOUT.typography.bullets.fontSize,
        fontFace: fonts.body,
        color: colors.textPrimary,
        bullet: { type: 'bullet', style: '•' },
        lineSpacing: LAYOUT.typography.bullets.lineSpacing,
        valign: 'top'
      });
    }
  }
}

/* -------------------------------------------------------------------------------------------------
 * Data Parsing Utilities
 * ------------------------------------------------------------------------------------------------- */



/**
 * Generate comprehensive metadata for the presentation with enhanced analytics
 */
function generateMetadata(specs: SlideSpec[], options: any = {}) {
  const currentDate = new Date();

  try {
    // Enhanced word count calculation
    const totalWords = specs.reduce((count, spec) => {
      let words = 0;

      // Count title words
      if (spec.title) {
        words += spec.title.split(/\s+/).filter(word => word.length > 0).length;
      }

      // Count paragraph words
      if (spec.paragraph) {
        words += spec.paragraph.split(/\s+/).filter(word => word.length > 0).length;
      }

      // Count bullet words
      if (spec.bullets && spec.bullets.length > 0) {
        words += spec.bullets.join(' ').split(/\s+/).filter(word => word.length > 0).length;
      }

      // Count table content words
      if (spec.comparisonTable?.rows) {
        const tableText = spec.comparisonTable.rows.flat().join(' ');
        words += tableText.split(/\s+/).filter(word => word.length > 0).length;
      }

      return count + words;
    }, 0);

    // Calculate presentation statistics
    const estimatedReadingTime = Math.max(1, Math.ceil(totalWords / 200)); // 200 words per minute, minimum 1 minute
    const slideTypes = specs.reduce((types, spec) => {
      const layout = spec.layout || 'content';
      types[layout] = (types[layout] || 0) + 1;
      return types;
    }, {} as Record<string, number>);

    return {
      title: safeText(specs.length > 0 ? specs[0].title : 'Professional Presentation', 100),
      author: safeText(options.author || 'AI PowerPoint Generator', 50),
      company: safeText(options.company || 'Professional Presentations', 50),
      subject: safeText(options.subject || 'AI-Generated Presentation', 100),
      created: currentDate.toISOString(),
      modified: currentDate.toISOString(),
      slideCount: specs.length,
      wordCount: totalWords,
      estimatedReadingTime: `${estimatedReadingTime} minute${estimatedReadingTime !== 1 ? 's' : ''}`,
      slideTypes: slideTypes,
      generator: 'AI PowerPoint Generator v5.0.0-enhanced',
      version: '5.0.0-enhanced',
      generatedAt: currentDate.toLocaleString(),
      // Additional metadata for professional presentations
      keywords: extractKeywords(specs),
      complexity: calculateComplexity(specs),
      accessibility: {
        hasAltText: specs.some(spec => spec.imageUrl || spec.layout?.includes('image')),
        hasStructuredContent: specs.some(spec => spec.bullets || spec.comparisonTable),
        readabilityScore: Math.min(100, Math.max(0, 100 - (totalWords / specs.length - 50)))
      }
    };
  } catch (error) {
    logger.warn('Metadata generation failed, using fallback', { error });
    return {
      title: 'Professional Presentation',
      author: options.author || 'AI PowerPoint Generator',
      company: options.company || 'Professional Presentations',
      subject: options.subject || 'AI-Generated Presentation',
      created: currentDate.toISOString(),
      modified: currentDate.toISOString(),
      slideCount: specs.length,
      wordCount: 0,
      estimatedReadingTime: '1 minute',
      generator: 'AI PowerPoint Generator v5.0.0-enhanced',
      version: '5.0.0-enhanced'
    };
  }
}

/**
 * Extract keywords from slide content for metadata
 */
function extractKeywords(specs: SlideSpec[]): string[] {
  try {
    const allText = specs.map(spec => [
      spec.title || '',
      spec.paragraph || '',
      ...(spec.bullets || [])
    ].join(' ')).join(' ');

    // Simple keyword extraction (words longer than 4 characters, appearing more than once)
    const words = allText.toLowerCase().split(/\s+/).filter(word =>
      word.length > 4 && /^[a-zA-Z]+$/.test(word)
    );

    const wordCount = words.reduce((count, word) => {
      count[word] = (count[word] || 0) + 1;
      return count;
    }, {} as Record<string, number>);

    return Object.entries(wordCount)
      .filter(([_, count]) => count > 1)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  } catch (error) {
    logger.warn('Keyword extraction failed', { error });
    return [];
  }
}

/**
 * Calculate presentation complexity score
 */
function calculateComplexity(specs: SlideSpec[]): 'simple' | 'moderate' | 'complex' {
  try {
    let complexityScore = 0;

    specs.forEach(spec => {
      // Layout complexity
      if (spec.layout === 'two-column') complexityScore += 2;
      if (spec.layout === 'chart') complexityScore += 3;
      if (spec.layout === 'comparison-table') complexityScore += 3;

      // Content complexity
      if (spec.bullets && spec.bullets.length > 5) complexityScore += 2;
      if (spec.comparisonTable) complexityScore += 3;
      if (spec.chart) complexityScore += 3;
      if (spec.imageUrl || spec.layout?.includes('image')) complexityScore += 1;
    });

    const avgComplexity = complexityScore / specs.length;

    if (avgComplexity < 1.5) return 'simple';
    if (avgComplexity < 3) return 'moderate';
    return 'complex';
  } catch (error) {
    logger.warn('Complexity calculation failed', { error });
    return 'moderate';
  }
}

/**
 * Generate comprehensive speaker notes for slides
 */
function generateSpeakerNotes(spec: SlideSpec, slideNumber: number, totalSlides: number): string {
  try {
    const notes: string[] = [];

    // Use existing notes if available
    if (spec.notes) {
      notes.push(safeText(spec.notes, 500));
    } else {
      // Generate automatic speaker notes based on content
      notes.push(`Slide ${slideNumber} of ${totalSlides}: ${safeText(spec.title || 'Untitled Slide', 100)}`);

      if (spec.paragraph) {
        notes.push(`Key message: ${safeText(spec.paragraph, 200)}`);
      }

      if (spec.bullets && spec.bullets.length > 0) {
        notes.push(`Main points to cover:`);
        spec.bullets.slice(0, 5).forEach((bullet, index) => {
          notes.push(`${index + 1}. ${safeText(bullet, 150)}`);
        });
      }

      if (spec.chart) {
        notes.push(`Chart presentation: Highlight the key data trends and insights from the ${spec.chart.title || 'chart'}.`);
      }

      if (spec.comparisonTable) {
        notes.push(`Table discussion: Walk through the comparison points and emphasize key differences or similarities.`);
      }

      // Add transition guidance
      if (slideNumber < totalSlides) {
        notes.push(`Transition: Connect this content to the next slide's topic.`);
      }

      // Add timing guidance
      const estimatedTime = Math.max(1, Math.ceil((notes.join(' ').split(' ').length) / 150)); // 150 words per minute speaking
      notes.push(`Estimated speaking time: ${estimatedTime} minute${estimatedTime !== 1 ? 's' : ''}`);
    }

    return notes.join('\n\n');
  } catch (error) {
    logger.warn('Speaker notes generation failed', { slideNumber, error });
    return `Slide ${slideNumber}: ${spec.title || 'Untitled Slide'}`;
  }
}

/* -------------------------------------------------------------------------------------------------
 * Main Generation Function
 * ------------------------------------------------------------------------------------------------- */

/**
 * Generate enhanced PowerPoint presentation with professional design
 * Simplified interface with comprehensive options for professional presentations
 */
export async function generateSimplePpt(
  specs: SlideSpec[],
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

    // Set enhanced presentation metadata
    if (options.includeMetadata !== false) {
      const metadata = generateMetadata(specs, options);
      pres.author = metadata.author;
      pres.company = metadata.company;
      pres.subject = metadata.subject;
      pres.title = metadata.title;
      pres.revision = '1';

      // Additional metadata for professional presentations
      logger.info('Presentation metadata generated', context, {
        slideCount: metadata.slideCount,
        wordCount: metadata.wordCount,
        estimatedReadingTime: metadata.estimatedReadingTime,
        complexity: metadata.complexity
      });
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

        // Add enhanced speaker notes if enabled
        if (options.includeSpeakerNotes) {
          const speakerNotes = generateSpeakerNotes(spec, index + 1, specs.length);
          if (speakerNotes) {
            slide.addNotes(speakerNotes);
          }
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
