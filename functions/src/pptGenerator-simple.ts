/**
 * Professional PowerPoint Generator - Simplified & Enhanced
 *
 * CORE FEATURES:
 * - Professional 16:9 slide layouts with modern design aesthetics
 * - Optimized typography system with PowerPoint-native fonts
 * - Native chart and table support with theme-consistent styling
 * - Comprehensive speaker notes and metadata generation
 * - Robust error handling with graceful fallbacks
 * - AI-agent-friendly code structure with extensive documentation
 *
 * ENHANCEMENTS:
 * - Simplified code structure for better maintainability and performance
 * - Enhanced visual design with professional corporate styling
 * - Streamlined layout generation with consistent spacing
 * - Optimized chart and table rendering with better data visualization
 * - Professional image handling with proper aspect ratios
 * - Advanced theme integration with consistent color schemes
 * - Reduced complexity while maintaining full functionality
 *
 * @version 7.0.0-simplified
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

// Simplified layout configuration with professional spacing and modern design principles
const LAYOUT = {
  // Professional margins with balanced whitespace
  margins: { top: 0.6, bottom: 0.5, left: 0.7, right: 0.7 },

  // Simplified typography system optimized for readability and PowerPoint compatibility
  typography: {
    title: { fontSize: 36, lineSpacing: 42, fontWeight: 'bold' as const },
    subtitle: { fontSize: 24, lineSpacing: 30, fontWeight: 'normal' as const },
    body: { fontSize: 18, lineSpacing: 24, fontWeight: 'normal' as const },
    bullets: { fontSize: 16, lineSpacing: 22, fontWeight: 'normal' as const },
    caption: { fontSize: 12, lineSpacing: 16, fontWeight: 'normal' as const }
  },

  // Simplified spacing system for consistent visual rhythm
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
 * Simplified PowerPoint file validation with essential checks
 * Performs key validation to ensure file integrity before sending to client
 */
function validatePowerPointBuffer(buffer: Buffer, context: any): void {
  // Basic buffer validation
  if (!buffer || buffer.length === 0) {
    throw new Error('PowerPoint buffer is null, undefined, or empty');
  }

  // Check minimum file size (PowerPoint files are typically at least 15KB)
  if (buffer.length < 15000) {
    logger.warn('PowerPoint file is very small, may indicate generation issues', context, {
      bufferSize: buffer.length,
      minimumExpected: 15000
    });
  }

  // Validate ZIP signature (PowerPoint files are ZIP archives)
  const zipSignature = buffer.subarray(0, 4);
  const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]); // "PK\x03\x04"
  if (!zipSignature.equals(expectedSignature)) {
    logger.error('Invalid PowerPoint file signature detected', context, {
      actualSignature: Array.from(zipSignature).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
      bufferSize: buffer.length
    });
    throw new Error('Generated PowerPoint file has invalid ZIP signature - file is corrupted');
  }

  // Check for reasonable file size limits (max 50MB for simplified version)
  if (buffer.length > 50 * 1024 * 1024) {
    logger.warn('PowerPoint file is very large', context, {
      bufferSize: buffer.length,
      bufferSizeMB: Math.round(buffer.length / 1024 / 1024),
      maximumRecommended: 50
    });
  }

  logger.debug('PowerPoint buffer validation passed', context, {
    bufferSize: buffer.length,
    bufferSizeKB: Math.round(buffer.length / 1024),
    signatureValid: true
  });
}

/**
 * Simplified image processing for professional presentations
 * Returns basic image configuration with safe defaults
 */
function processImageForSlide(imageUrl: string, targetWidth: number, targetHeight: number): any {
  try {
    return {
      path: imageUrl,
      w: targetWidth,
      h: targetHeight,
      sizing: {
        type: 'contain', // Maintain aspect ratio
        w: targetWidth,
        h: targetHeight
      }
    };
  } catch (error) {
    logger.warn('Image processing failed, using fallback', { imageUrl, error });
    return {
      path: imageUrl,
      w: targetWidth,
      h: targetHeight
    };
  }
}

/**
 * Convert color input to safe 6-digit hex format for PowerPoint
 * Simplified with essential validation
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
 * Get PowerPoint-compatible font name with simplified mapping
 * Ensures professional typography with safe defaults
 */
function getPowerPointFont(fontFamily?: string): string {
  const fontMap: Record<string, string> = {
    // Core PowerPoint fonts
    'Inter': 'Calibri',
    'SF Pro Display': 'Calibri',
    'system-ui': 'Calibri',
    'Segoe UI': 'Segoe UI',
    'Arial': 'Arial',
    'Helvetica': 'Arial',
    'Times New Roman': 'Times New Roman',
    'Georgia': 'Georgia',
    // Web font fallbacks
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
 * Get theme colors with safe fallbacks and enhanced color palette
 * Ensures proper contrast for readability on white backgrounds
 */
function getThemeColors(theme: ProfessionalTheme) {
  // For consulting charcoal theme, ensure text colors have proper contrast
  const isConsultingCharcoal = theme.id === 'consulting-charcoal';

  return {
    primary: safeColor(theme.colors.primary, '1E40AF'),
    secondary: safeColor(theme.colors.secondary, '3B82F6'),
    accent: safeColor(theme.colors.accent, 'F59E0B'),
    background: safeColor(theme.colors.background, 'FFFFFF'),
    surface: safeColor(theme.colors.surface, 'F8FAFC'),
    // Ensure text colors have proper contrast on white background
    textPrimary: isConsultingCharcoal ?
      safeColor(theme.colors.text.primary, '111827') :
      safeColor(theme.colors.text.primary, '1F2937'),
    textSecondary: isConsultingCharcoal ?
      safeColor(theme.colors.text.secondary, '374151') :
      safeColor(theme.colors.text.secondary, '6B7280'),
    textMuted: safeColor(theme.colors.text.muted, '9CA3AF'),
    textInverse: safeColor(theme.colors.text.inverse, 'FFFFFF'),
    success: safeColor(theme.colors.semantic?.success, '10B981'),
    warning: safeColor(theme.colors.semantic?.warning, 'F59E0B'),
    error: safeColor(theme.colors.semantic?.error, 'EF4444'),
    info: safeColor(theme.colors.semantic?.info, '3B82F6'),
    borderLight: safeColor(theme.colors.borders?.light, 'F3F4F6'),
    borderMedium: safeColor(theme.colors.borders?.medium, 'E5E7EB'),
    borderStrong: safeColor(theme.colors.borders?.strong, 'D1D5DB')
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
    // Ultra-aggressive sanitization for PowerPoint compatibility
    let cleaned = text
      // Remove all control characters and problematic Unicode
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
      .replace(/[\uFFFE\uFFFF]/g, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[\u2028\u2029]/g, ' ') // Line/paragraph separators to space

      // Normalize whitespace aggressively
      .replace(/\s+/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/\r\n/g, ' ')
      .replace(/[\r\n]/g, ' ')

      // Remove or replace problematic characters
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .replace(/[–—]/g, '-')
      .replace(/[…]/g, '...')
      .replace(/[•]/g, '*')

      // Remove any remaining non-printable characters
      .replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F]/g, '')

      // Final cleanup
      .trim();

    // Ensure we don't have empty content
    if (cleaned.length === 0) {
      return 'Content';
    }

    // Truncate if needed
    if (cleaned.length <= maxLength) return cleaned;

    // Smart truncation with word boundary detection
    const truncated = cleaned.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    const result = (lastSpace > maxLength * 0.8 ? truncated.substring(0, lastSpace) : truncated) + '...';

    // Final validation - ensure result is not empty
    return result.trim() || 'Content';
  } catch (error) {
    logger.warn('Text sanitization failed', { text: text?.substring(0, 50), error });
    return 'Content';
  }
}

/**
 * Enhanced bullet point formatting with better structure and validation
 */
function formatBullets(bullets: string[]): string {
  if (!bullets || bullets.length === 0) return '';

  try {
    const safeBullets = bullets
      .filter(bullet => bullet && typeof bullet === 'string' && bullet.trim().length > 0)
      .map(bullet => {
        // Extra sanitization for bullet points
        let cleaned = safeText(bullet.trim(), 120); // Reduced length to prevent overlap

        // Remove test markup prefixes like [B1], [TEST-], etc.
        cleaned = cleaned.replace(/^\[(?:B\d+|TEST-[^\]]*|SLIDE-\d+)\]\s*/, '');

        // Ensure bullets don't start with problematic characters
        cleaned = cleaned.replace(/^[•\-\*\+]+\s*/, '').trim();

        // Ensure we have valid content
        return cleaned || 'Key point';
      })
      .slice(0, 4); // Reduced to 4 bullets to prevent overcrowding

    // Ensure we have at least one bullet
    if (safeBullets.length === 0) {
      return 'Key point';
    }

    return safeBullets.join('\n');
  } catch (error) {
    logger.warn('Bullet formatting failed', { bullets, error });
    return 'Key point';
  }
}

/**
 * Validate and sanitize slide specification to prevent PowerPoint corruption
 */
function validateSlideSpec(spec: SlideSpec, index: number): SlideSpec {
  const validated: SlideSpec = { ...spec };

  // Ensure title is valid
  if (!validated.title || validated.title.trim().length === 0) {
    validated.title = `Slide ${index + 1}`;
  } else {
    validated.title = safeText(validated.title, 200);
  }

  // Ensure layout is valid
  if (!validated.layout || !['title', 'title-bullets', 'chart', 'comparison-table', 'two-column'].includes(validated.layout)) {
    validated.layout = 'title-bullets';
  }

  // Sanitize paragraph content
  if (validated.paragraph) {
    validated.paragraph = safeText(validated.paragraph, 1000);
  }

  // Sanitize bullets
  if (validated.bullets && Array.isArray(validated.bullets)) {
    validated.bullets = validated.bullets
      .filter(bullet => bullet && typeof bullet === 'string')
      .map(bullet => safeText(bullet, 300))
      .slice(0, 7); // Limit bullets to prevent overcrowding
  }

  // Sanitize notes
  if (validated.notes) {
    validated.notes = safeText(validated.notes, 2000);
  }

  return validated;
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
function determineOptimalChartType(chartData: any[], preferredType?: string): string {
  if (!chartData || chartData.length === 0) return 'column';

  const dataPoints = chartData[0]?.values?.length || 0;
  const hasMultipleSeries = chartData.length > 1;

  // Use preferred type if specified and valid
  if (preferredType && ['bar', 'column', 'line', 'pie', 'area'].includes(preferredType)) {
    return preferredType;
  }

  // Auto-determine based on data characteristics
  if (dataPoints <= 6 && !hasMultipleSeries) {
    return 'pie'; // Good for showing parts of a whole
  } else if (dataPoints > 10 || hasMultipleSeries) {
    return 'line'; // Better for trends and multiple series
  } else {
    return 'column'; // Default for most cases
  }
}

/**
 * Create enhanced chart configuration with professional styling
 */
function createChartConfig(chartType: string, chartData: any[], colors: any, fonts: any, title?: string) {
  const baseConfig = {
    chartColors: colors.slice(0, chartData.length),
    showTitle: !!title,
    title: title ? safeText(title, 80) : '',
    titleFontSize: LAYOUT.typography.body.fontSize,
    titleFontFace: fonts.heading,
    titleColor: colors.primary,
    showLegend: chartData.length > 1,
    legendPos: 'r' as const,
    legendFontSize: LAYOUT.typography.caption.fontSize,
    legendFontFace: fonts.body,
    showValue: true,
    dataLabelFontSize: LAYOUT.typography.caption.fontSize,
    dataLabelFontFace: fonts.body,
    dataLabelColor: colors.textPrimary,
    border: { pt: 1, color: colors.borderLight },
    fill: colors.surface,
    plotArea: {
      fill: { color: colors.background, transparency: 0 },
      border: { pt: 1, color: colors.borderMedium }
    }
  };

  // Enhanced chart-specific configurations with professional styling
  switch (chartType) {
    case 'pie':
      return {
        ...baseConfig,
        showPercent: true,
        dataLabelPosition: 'outEnd',
        holeSize: 40, // Donut style for modern look
        showLeaderLines: true,
        legendPos: 'r',
        // Removed shadow to prevent corruption
      };
    case 'line':
      return {
        ...baseConfig,
        lineSmooth: true,
        lineSize: 4,
        showMarkers: true,
        markerSize: 8,
        markerSymbol: 'circle',
        gridLines: {
          style: 'solid',
          size: 1,
          color: colors.borderLight
        },
        // Removed shadow to prevent corruption
      };
    case 'bar':
    case 'column':
      return {
        ...baseConfig,
        barGapWidthPct: 20, // Tighter spacing for modern look
        barGrouping: 'clustered',
        showValue: true,
        dataLabelPosition: 'outEnd',
        gridLines: {
          style: 'solid',
          size: 1,
          color: colors.borderLight
        },
        // Removed shadow to prevent corruption
      };
    case 'area':
      return {
        ...baseConfig,
        lineSmooth: true,
        lineSize: 3,
        showMarkers: false,
        transparency: 30, // Semi-transparent fill
        // Removed shadow to prevent corruption
      };
    default:
      return baseConfig;
  }
}



/**
 * Parse table data from slide specification
 */
function parseTableData(spec: SlideSpec): string[][] | null {
  try {
    // Check for comparisonTable data structure (primary format)
    if (spec.comparisonTable && spec.comparisonTable.headers && spec.comparisonTable.rows) {
      const headers = spec.comparisonTable.headers;
      const rows = spec.comparisonTable.rows;
      return [headers, ...rows];
    }

    // Check if table data is provided directly (legacy format)
    if (spec.table && spec.table.rows && spec.table.rows.length > 0) {
      const headers = spec.table.columns || [];
      const rows = spec.table.rows;
      return headers.length > 0 ? [headers, ...rows] : rows;
    }

    // Parse from bullets if no direct table data
    if (spec.bullets && spec.bullets.length > 0) {
      const tableRows: string[][] = [];
      let currentRow: string[] = [];

      spec.bullets.forEach(bullet => {
        // Check for table-like patterns
        if (bullet.includes('|')) {
          // Pipe-separated values
          const cells = bullet.split('|').map(cell => safeText(cell.trim(), 100));
          if (cells.length > 1) {
            tableRows.push(cells);
          }
        } else if (bullet.includes('\t')) {
          // Tab-separated values
          const cells = bullet.split('\t').map(cell => safeText(cell.trim(), 100));
          if (cells.length > 1) {
            tableRows.push(cells);
          }
        } else if (bullet.includes(':') && bullet.split(':').length === 2) {
          // Key-value pairs
          const [key, value] = bullet.split(':');
          currentRow.push(safeText(key.trim(), 50), safeText(value.trim(), 100));
          if (currentRow.length >= 2) {
            tableRows.push([...currentRow]);
            currentRow = [];
          }
        }
      });

      return tableRows.length > 0 ? tableRows : null;
    }

    return null;
  } catch (error) {
    logger.warn('Table data parsing failed', { error });
    return null;
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
    // Removed autoFit to prevent corruption
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



/* -------------------------------------------------------------------------------------------------
 * Design Elements
 * ------------------------------------------------------------------------------------------------- */

/**
 * Add enhanced professional header accent with modern styling
 */
function addHeaderAccent(slide: any, theme: ProfessionalTheme) {
  const colors = getThemeColors(theme);

  try {
    // Safe solid header accent for all themes (no gradients)
    slide.addShape('rect', {
      x: 0,
      y: 0,
      w: SLIDE.width,
      h: 0.08,
      fill: { color: colors.accent },
      line: { width: 0 }
    });

    // Add subtle shadow effect for depth
    slide.addShape('rect', {
      x: 0,
      y: 0.08,
      w: SLIDE.width,
      h: 0.02,
      fill: { color: colors.borderLight }, // Simplified color without transparency
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
    // Safe solid background for all themes (no gradients)
    slide.background = { color: colors.background };

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
 * Add simplified design elements for content slides
 */
function addContentSlideDesignElements(slide: any, theme: ProfessionalTheme, slideIndex: number) {
  const colors = getThemeColors(theme);

  // Simple bottom accent line for all slides
  slide.addShape('rect', {
    x: 0,
    y: SLIDE.height - 0.05,
    w: SLIDE.width * 0.4,
    h: 0.05,
    fill: { color: colors.primary, transparency: 80 },
    line: { width: 0 }
  });
}

/* -------------------------------------------------------------------------------------------------
 * Slide Generation Functions - Simplified & Optimized
 *
 * Core slide types:
 * - Title slides with professional typography
 * - Content slides with bullet points and structured text
 * - Chart slides with native PowerPoint charts
 * - Table slides with professional formatting
 * - Two-column layouts for comparative content
 * - Image slides with proper aspect ratio handling
 *
 * Design principles:
 * - Consistent styling with theme colors and fonts
 * - Professional typography and spacing
 * - Graceful error handling with fallbacks
 * - AI-agent friendly with clear documentation
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
    // Main title with enhanced typography and proper color
    slide.addText(safeText(spec.title, 120), {
      x: CONTENT.x,
      y: 1.8,
      w: CONTENT.width,
      h: 1.2,
      fontSize: 44,
      fontFace: fonts.heading,
      color: colors.textPrimary, // Use text color for better readability
      bold: true,
      align: 'center',
      valign: 'middle',
      // Removed shadow to prevent PowerPoint corruption
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

  // Title with proper text color for readability
  slide.addText(safeText(spec.title, 120), {
    x: CONTENT.x,
    y: CONTENT.y,
    w: CONTENT.width,
    h: CONTENT.titleHeight,
    fontSize: LAYOUT.typography.title.fontSize,
    fontFace: fonts.heading,
    color: colors.textPrimary, // Use text color for better contrast
    bold: true,
    valign: 'middle'
  });

  // Content area with ultra-conservative formatting
  const contentY = CONTENT.bodyY;
  const contentHeight = CONTENT.bodyHeight;

  if (spec.bullets && spec.bullets.length > 0) {
    // Ultra-safe bullet points with improved spacing and formatting
    const bulletText = formatBullets(spec.bullets);
    slide.addText(bulletText, {
      x: CONTENT.x,
      y: contentY,
      w: CONTENT.width,
      h: Math.min(contentHeight, 4.0), // Limit height to prevent overlap
      fontSize: 14, // Slightly smaller font to prevent crowding
      fontFace: 'Calibri', // PowerPoint default font
      color: colors.textSecondary, // Use theme text color for consistency
      bullet: { type: 'bullet', style: '•' },
      lineSpacing: 1.4, // Increased line spacing to prevent overlap
      valign: 'top',
      wrap: true,
      // Removed autoFit and margin properties to prevent corruption
    });
  } else if (spec.paragraph) {
    // Ultra-safe paragraph text
    const paragraphText = safeText(spec.paragraph, 800);
    slide.addText(paragraphText, {
      x: CONTENT.x,
      y: contentY,
      w: CONTENT.width,
      h: contentHeight,
      fontSize: 16, // Fixed safe font size
      fontFace: 'Calibri', // PowerPoint default font
      color: '333333', // Safe hex color
      lineSpacing: 1.2, // Conservative line spacing
      valign: 'top',
      wrap: true
      // Removed autoFit to prevent corruption
    });
  } else {
    // Fallback content to ensure slide is never empty
    slide.addText('Content will be displayed here.', {
      x: CONTENT.x,
      y: contentY,
      w: CONTENT.width,
      h: contentHeight,
      fontSize: 16,
      fontFace: 'Calibri',
      color: '666666',
      lineSpacing: 1.2,
      valign: 'middle',
      align: 'center',
      wrap: true
      // Removed autoFit to prevent corruption
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
      generator: 'AI PowerPoint Generator v6.0.0-enhanced',
      version: '6.0.0-enhanced',
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
      generator: 'AI PowerPoint Generator v6.0.0-enhanced',
      version: '6.0.0-enhanced'
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
      // Generate comprehensive automatic speaker notes based on content
      notes.push(`=== SLIDE ${slideNumber} OF ${totalSlides} ===`);
      notes.push(`Title: ${safeText(spec.title || 'Untitled Slide', 100)}`);
      notes.push('');

      // Opening guidance
      if (slideNumber === 1) {
        notes.push('OPENING: Welcome your audience and introduce the presentation topic.');
      } else {
        notes.push('TRANSITION: Briefly connect to the previous slide before introducing this topic.');
      }
      notes.push('');

      // Content-specific guidance
      if (spec.layout === 'title') {
        notes.push('PRESENTATION GUIDANCE:');
        notes.push('- This is your title slide - use it to set the tone');
        notes.push('- Introduce yourself and your credentials');
        notes.push('- Provide a brief overview of what the audience will learn');
        if (spec.paragraph) {
          notes.push(`- Key message to emphasize: ${safeText(spec.paragraph, 200)}`);
        }
      } else if (spec.layout === 'chart') {
        notes.push('CHART PRESENTATION:');
        notes.push('- Start with the main insight or conclusion');
        notes.push('- Walk through the data systematically');
        notes.push('- Highlight key trends, outliers, or patterns');
        notes.push('- Connect the data to your overall message');
        if (spec.chart?.title) {
          notes.push(`- Focus on: ${safeText(spec.chart.title, 100)}`);
        }
      } else if (spec.layout === 'comparison-table') {
        notes.push('TABLE DISCUSSION:');
        notes.push('- Guide the audience through each comparison point');
        notes.push('- Highlight the most important differences or similarities');
        notes.push('- Use the table to support your recommendation or conclusion');
        notes.push('- Be prepared to answer questions about specific data points');
      } else {
        notes.push('CONTENT DELIVERY:');
        if (spec.paragraph) {
          notes.push(`- Main message: ${safeText(spec.paragraph, 200)}`);
        }
        if (spec.bullets && spec.bullets.length > 0) {
          notes.push('- Key points to cover:');
          spec.bullets.slice(0, 6).forEach((bullet, index) => {
            notes.push(`  ${index + 1}. ${safeText(bullet, 150)}`);
          });
        }
      }

      notes.push('');

      // Engagement tips
      notes.push('ENGAGEMENT TIPS:');
      if (spec.bullets && spec.bullets.length > 3) {
        notes.push('- Consider asking the audience which point resonates most with them');
      }
      if (spec.chart) {
        notes.push('- Ask if anyone has questions about the data before moving on');
      }
      notes.push('- Pause for questions if this is a complex topic');
      notes.push('- Make eye contact and check for understanding');

      notes.push('');

      // Timing and transition
      const wordCount = notes.join(' ').split(' ').length;
      const estimatedTime = Math.max(1, Math.ceil(wordCount / 150)); // 150 words per minute
      notes.push(`TIMING: Estimated ${estimatedTime} minute${estimatedTime !== 1 ? 's' : ''} for this slide`);

      if (slideNumber < totalSlides) {
        notes.push('TRANSITION: Prepare to connect this content to the next slide\'s topic');
      } else {
        notes.push('CLOSING: Summarize key takeaways and open for final questions');
      }
    }

    return notes.join('\n');
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

    // Set enhanced presentation metadata with comprehensive properties
    if (options.includeMetadata !== false) {
      const metadata = generateMetadata(specs, options);
      pres.author = metadata.author;
      pres.company = metadata.company;
      pres.subject = metadata.subject;
      pres.title = metadata.title;
      pres.revision = '1';

      // Enhanced metadata properties (using available PptxGenJS properties)
      try {
        // Add custom properties if supported
        if (metadata.keywords && metadata.keywords.length > 0) {
          // Store keywords in subject if not already used
          if (!pres.subject.includes(metadata.keywords[0])) {
            pres.subject += ` - Keywords: ${metadata.keywords.slice(0, 3).join(', ')}`;
          }
        }
      } catch (error) {
        logger.warn('Failed to set enhanced metadata properties', { error });
      }

      // Additional metadata for professional presentations
      logger.info('Presentation metadata generated', context, {
        slideCount: metadata.slideCount,
        wordCount: metadata.wordCount,
        estimatedReadingTime: metadata.estimatedReadingTime,
        complexity: metadata.complexity
      });
    }

    // Generate slides with enhanced validation
    specs.forEach((spec, index) => {
      try {
        logger.debug(`Generating slide ${index + 1}/${specs.length}`, context, {
          title: spec.title,
          layout: spec.layout
        });

        // Validate and sanitize slide specification
        const validatedSpec = validateSlideSpec(spec, index);

        const slide = pres.addSlide();

        // Apply safe background (no gradients)
        try {
          const colors = getThemeColors(theme);
          slide.background = { color: colors.background };
        } catch (bgError) {
          logger.warn(`Failed to set background for slide ${index + 1}`, context, { error: bgError });
          // Continue without background - PowerPoint will use default
        }

        // Add professional background and design elements
        addProfessionalBackground(slide, theme, index);

        // Add content based on layout with enhanced error handling
        try {
          switch (validatedSpec.layout) {
            case 'title':
              addTitleSlide(slide, validatedSpec, theme);
              break;
            case 'chart':
              addChartSlide(slide, validatedSpec, theme);
              break;
            case 'comparison-table':
              addTableSlide(slide, validatedSpec, theme);
              break;
            case 'two-column':
              addTwoColumnSlide(slide, validatedSpec, theme);
              break;
            default:
              addContentSlide(slide, validatedSpec, theme);
          }
        } catch (layoutError) {
          logger.warn(`Layout generation failed for slide ${index + 1}, using safe fallback`, context, {
            layout: validatedSpec.layout,
            error: layoutError instanceof Error ? layoutError.message : String(layoutError)
          });
          // Safe fallback to basic content slide
          addContentSlide(slide, validatedSpec, theme);
        }

        // Add enhanced speaker notes if enabled
        if (options.includeSpeakerNotes) {
          try {
            const speakerNotes = generateSpeakerNotes(validatedSpec, index + 1, specs.length);
            if (speakerNotes && speakerNotes.trim().length > 0) {
              slide.addNotes(safeText(speakerNotes, 2000));
            }
          } catch (notesError) {
            logger.warn(`Failed to add speaker notes for slide ${index + 1}`, context, {
              error: notesError instanceof Error ? notesError.message : String(notesError)
            });
          }
        }

        // Add slide number
        addSlideNumber(slide, theme, index, specs.length);

      } catch (slideError) {
        logger.warn(`Failed to generate slide ${index + 1}, using minimal fallback`, context, {
          error: slideError instanceof Error ? slideError.message : String(slideError)
        });

        // Minimal fallback slide to prevent corruption
        try {
          const slide = pres.addSlide();
          addProfessionalBackground(slide, theme, index);

          // Add minimal safe content
          slide.addText(safeText(spec.title || `Slide ${index + 1}`, 100), {
            x: 1,
            y: 2,
            w: 8,
            h: 1,
            fontSize: 24,
            fontFace: 'Calibri',
            color: theme.colors.text.primary,
            bold: true
          });

          addSlideNumber(slide, theme, index, specs.length);
        } catch (fallbackError) {
          logger.error(`Critical failure generating slide ${index + 1}`, context, {
            error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
          });
          // Continue with next slide rather than failing entire presentation
        }
      }
    });

    // Generate buffer with PowerPoint-compliant settings
    logger.info('Generating PowerPoint buffer', context);
    let buffer: Buffer | null = null;

    // Generate metadata for PowerPoint compliance
    const presentationMetadata = generateMetadata(specs, options);

    // Apply metadata to presentation for better compatibility
    if (presentationMetadata.title) pres.title = presentationMetadata.title;
    if (presentationMetadata.author) pres.author = presentationMetadata.author;
    if (presentationMetadata.company) pres.company = presentationMetadata.company;
    if (presentationMetadata.subject) pres.subject = presentationMetadata.subject;

    // Use ultra-safe PowerPoint export options based on style testing
    const writeOptions = {
      outputType: 'nodebuffer' as const,
      compression: true, // Tested and verified safe
      // Remove rtlMode as it's not supported in current pptxgenjs version
    };

    // Retry mechanism for buffer generation
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`PowerPoint buffer generation attempt ${attempt}/${maxRetries}`, context);

        // Clear any previous state that might cause issues
        if (attempt > 1) {
          // Force garbage collection if available
          if (global.gc) {
            global.gc();
          }

          // Small delay to allow cleanup
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        const generatedBuffer = await pres.write(writeOptions) as Buffer;

        // Validate the generated buffer
        if (generatedBuffer && generatedBuffer.length > 0) {
          buffer = generatedBuffer;
          logger.debug(`PowerPoint buffer generated successfully on attempt ${attempt}`, context, {
            bufferSize: buffer.length
          });
          break;
        } else {
          throw new Error('Generated buffer is empty or null');
        }
      } catch (writeError) {
        lastError = writeError instanceof Error ? writeError : new Error(String(writeError));
        logger.warn(`PowerPoint buffer generation attempt ${attempt} failed`, context, {
          error: lastError.message,
          attempt,
          maxRetries
        });

        if (attempt === maxRetries) {
          logger.error('All PowerPoint buffer generation attempts failed', context, {
            error: lastError.message,
            stack: lastError.stack,
            totalAttempts: maxRetries
          });
          throw new Error(`Failed to generate PowerPoint buffer after ${maxRetries} attempts: ${lastError.message}`);
        }

        // Progressive delay before retry
        await new Promise(resolve => setTimeout(resolve, 200 * attempt));
      }
    }

    // Comprehensive buffer validation
    if (!buffer) {
      throw new Error('Generated PowerPoint buffer is null - all generation attempts failed');
    }

    if (buffer.length === 0) {
      throw new Error('Generated PowerPoint buffer is empty');
    }

    // Validate ZIP signature (PowerPoint files are ZIP archives)
    const zipSignature = buffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]); // "PK\x03\x04"
    if (!zipSignature.equals(expectedSignature)) {
      logger.error('Invalid PowerPoint file signature detected', context, {
        actualSignature: Array.from(zipSignature).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
        expectedSignature: Array.from(expectedSignature).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
        bufferSize: buffer.length
      });
      throw new Error('Generated PowerPoint file has invalid ZIP signature - file may be corrupted');
    }

    // Check minimum reasonable file size
    if (buffer.length < 10000) {
      logger.warn('PowerPoint file is suspiciously small', context, {
        bufferSize: buffer.length,
        slideCount: specs.length
      });
    }

    // Check maximum reasonable file size (50MB)
    if (buffer.length > 50 * 1024 * 1024) {
      logger.warn('PowerPoint file is very large', context, {
        bufferSize: buffer.length,
        bufferSizeMB: Math.round(buffer.length / 1024 / 1024),
        slideCount: specs.length
      });
    }

    // Final comprehensive validation before returning
    validatePowerPointBuffer(buffer, context);

    const generationTime = Date.now() - startTime;
    logger.info('PowerPoint generation completed successfully', context, {
      slideCount: specs.length,
      bufferSize: buffer.length,
      bufferSizeKB: Math.round(buffer.length / 1024),
      generationTime: `${generationTime}ms`,
      validationPassed: true
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
