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
 * Safely convert color to valid format
 */
function safeColor(color: string | undefined, fallback: string): string {
  if (!color || typeof color !== 'string') return fallback;
  return color.replace('#', '').toUpperCase();
}

/**
 * Calculate content area dimensions
 */
function getContentArea() {
  const { margins } = DEFAULT_LAYOUT;
  return {
    x: margins.left,
    y: margins.top,
    width: SLIDE_DIMENSIONS.width - margins.left - margins.right,
    height: SLIDE_DIMENSIONS.height - margins.top - margins.bottom
  };
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
 * Add title slide with enhanced visual design
 */
function addTitleSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const contentArea = getContentArea();
  const { typography } = DEFAULT_LAYOUT;

  // Add subtle background gradient
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: SLIDE_DIMENSIONS.width,
    h: SLIDE_DIMENSIONS.height,
    fill: {
      type: 'gradient',
      angle: 45,
      colors: [
        { color: safeColor(theme.colors.background, 'FFFFFF'), position: 0 },
        { color: safeColor(theme.colors.surface, 'F8FAFC'), position: 100 }
      ]
    }
  });

  // Add accent line
  slide.addShape('line', {
    x: contentArea.x,
    y: contentArea.y + 1.3,
    w: contentArea.width * 0.3,
    h: 0,
    line: {
      color: safeColor(theme.colors.accent, 'F59E0B'),
      width: 4
    }
  });

  // Main title with enhanced typography
  slide.addText(spec.title || 'Untitled Presentation', {
    x: contentArea.x,
    y: contentArea.y + 1.5,
    w: contentArea.width,
    h: 1.2,
    fontSize: typography.title.fontSize + 4, // Slightly larger for title slides
    fontFace: theme.typography.headings.fontFamily,
    color: safeColor(theme.colors.text.primary, '1F2937'),
    bold: true,
    align: 'center',
    valign: 'middle',
    shadow: {
      type: 'outer',
      blur: 3,
      offset: 2,
      angle: 45,
      color: '00000015'
    }
  });

  // Subtitle with enhanced styling
  if (spec.paragraph) {
    slide.addText(spec.paragraph, {
      x: contentArea.x,
      y: contentArea.y + 3,
      w: contentArea.width,
      h: 0.8,
      fontSize: typography.body.fontSize + 2,
      fontFace: theme.typography.body.fontFamily,
      color: safeColor(theme.colors.text.secondary, '6B7280'),
      align: 'center',
      valign: 'middle',
      italic: true
    });
  }

  // Add decorative elements
  addDecorativeElements(slide, theme, 'title');
}

/**
 * Add content slide with enhanced visual design
 */
function addContentSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const contentArea = getContentArea();
  const { typography, spacing } = DEFAULT_LAYOUT;

  // Add subtle background pattern
  addBackgroundPattern(slide, theme);

  // Title with accent underline
  slide.addText(spec.title || 'Untitled Slide', {
    x: contentArea.x,
    y: contentArea.y,
    w: contentArea.width,
    h: 0.8,
    fontSize: typography.title.fontSize,
    fontFace: theme.typography.headings.fontFamily,
    color: safeColor(theme.colors.text.primary, '1F2937'),
    bold: true,
    valign: 'middle'
  });

  // Add accent underline for title
  slide.addShape('line', {
    x: contentArea.x,
    y: contentArea.y + 0.85,
    w: Math.min(contentArea.width * 0.4, (spec.title?.length || 10) * 0.15),
    h: 0,
    line: {
      color: safeColor(theme.colors.accent, 'F59E0B'),
      width: 3
    }
  });

  let currentY = contentArea.y + 0.8 + spacing.titleToContent;

  // Paragraph content with enhanced styling
  if (spec.paragraph) {
    // Add content card background
    slide.addShape('rect', {
      x: contentArea.x - 0.1,
      y: currentY - 0.1,
      w: contentArea.width + 0.2,
      h: 1.7,
      fill: { color: safeColor(theme.colors.surface, 'F8FAFC') },
      line: { color: safeColor(theme.colors.borders?.light, 'F3F4F6'), width: 1 },
      rectRadius: 0.1
    });

    slide.addText(spec.paragraph, {
      x: contentArea.x + 0.1,
      y: currentY,
      w: contentArea.width - 0.2,
      h: 1.5,
      fontSize: typography.body.fontSize,
      fontFace: theme.typography.body.fontFamily,
      color: safeColor(theme.colors.text.primary, '1F2937'),
      valign: 'top'
    });
    currentY += 1.7 + spacing.paragraphSpacing;
  }

  // Enhanced bullet points
  if (spec.bullets && spec.bullets.length > 0) {
    spec.bullets.forEach((bullet, index) => {
      // Bullet point background
      slide.addShape('rect', {
        x: contentArea.x - 0.05,
        y: currentY - 0.05,
        w: contentArea.width + 0.1,
        h: 0.4,
        fill: { color: safeColor(theme.colors.background, 'FFFFFF') },
        line: { color: safeColor(theme.colors.borders?.light, 'F3F4F6'), width: 0.5 },
        rectRadius: 0.05
      });

      // Custom bullet icon
      slide.addShape('circle', {
        x: contentArea.x + 0.1,
        y: currentY + 0.1,
        w: 0.15,
        h: 0.15,
        fill: { color: safeColor(theme.colors.accent, 'F59E0B') }
      });

      // Bullet text
      slide.addText(bullet, {
        x: contentArea.x + 0.35,
        y: currentY,
        w: contentArea.width - 0.4,
        h: 0.4,
        fontSize: typography.bullets.fontSize,
        fontFace: theme.typography.body.fontFamily,
        color: safeColor(theme.colors.text.primary, '1F2937'),
        valign: 'middle'
      });

      currentY += 0.45;
    });
  }

  // Add decorative elements
  addDecorativeElements(slide, theme, 'content');
}

/**
 * Add chart slide with enhanced data parsing
 */
function addChartSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const contentArea = getContentArea();
  const { typography, spacing } = DEFAULT_LAYOUT;

  // Title
  slide.addText(spec.title || 'Chart', {
    x: contentArea.x,
    y: contentArea.y,
    w: contentArea.width,
    h: 0.8,
    fontSize: typography.title.fontSize,
    fontFace: theme.typography.headings.fontFamily,
    color: safeColor(theme.colors.text.primary, '1F2937'),
    bold: true,
    valign: 'middle'
  });

  // Enhanced chart data parsing from bullets
  if (spec.bullets && spec.bullets.length > 0) {
    const chartData = parseChartDataFromBullets(spec.bullets);

    try {
      slide.addChart('bar', chartData, {
        x: contentArea.x,
        y: contentArea.y + 0.8 + spacing.titleToContent,
        w: contentArea.width,
        h: 3,
        chartColors: generateChartColors(theme, chartData.length),
        showTitle: true,
        showLegend: true,
        showValue: true,
        titleFontSize: 16,
        titleColor: safeColor(theme.colors.text.primary, '1F2937')
      });
    } catch (error) {
      // Fallback to text if chart fails
      addContentSlide(slide, spec, theme);
    }
  }
}

/**
 * Parse chart data from bullet points with intelligent data extraction
 */
function parseChartDataFromBullets(bullets: string[]): any[] {
  const chartData: any[] = [];

  bullets.forEach((bullet, index) => {
    // Try to extract numerical data from bullets
    const numberMatch = bullet.match(/(\d+(?:\.\d+)?)\s*(%|k|m|b)?/i);
    const labelMatch = bullet.match(/^([^:]+):/);

    let label = labelMatch ? labelMatch[1].trim() : `Item ${index + 1}`;
    let value = numberMatch ? parseFloat(numberMatch[1]) : Math.random() * 100 + 10;

    // Handle units
    if (numberMatch && numberMatch[2]) {
      const unit = numberMatch[2].toLowerCase();
      if (unit === 'k') value *= 1000;
      else if (unit === 'm') value *= 1000000;
      else if (unit === 'b') value *= 1000000000;
    }

    chartData.push({
      name: label,
      labels: [label],
      values: [value]
    });
  });

  return chartData;
}

/**
 * Generate theme-appropriate chart colors
 */
function generateChartColors(theme: ProfessionalTheme, count: number): string[] {
  const baseColors = [
    safeColor(theme.colors.primary, '3B82F6'),
    safeColor(theme.colors.secondary, '10B981'),
    safeColor(theme.colors.accent, 'F59E0B'),
    safeColor(theme.colors.semantic?.success, '10B981'),
    safeColor(theme.colors.semantic?.warning, 'F59E0B'),
    safeColor(theme.colors.semantic?.error, 'EF4444')
  ];

  // Extend colors if needed
  while (baseColors.length < count) {
    baseColors.push(...baseColors);
  }

  return baseColors.slice(0, count);
}

/**
 * Add table slide with professional formatting
 */
function addTableSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const contentArea = getContentArea();
  const { typography, spacing } = DEFAULT_LAYOUT;

  // Title
  slide.addText(spec.title || 'Table', {
    x: contentArea.x,
    y: contentArea.y,
    w: contentArea.width,
    h: 0.8,
    fontSize: typography.title.fontSize,
    fontFace: theme.typography.headings.fontFamily,
    color: safeColor(theme.colors.text.primary, '1F2937'),
    bold: true,
    valign: 'middle'
  });

  // Generate table from bullets
  if (spec.bullets && spec.bullets.length > 0) {
    const tableData = parseTableDataFromBullets(spec.bullets);

    try {
      slide.addTable(tableData, {
        x: contentArea.x,
        y: contentArea.y + 0.8 + spacing.titleToContent,
        w: contentArea.width,
        h: 2.5,
        fontSize: 12,
        fontFace: theme.typography.body.fontFamily,
        color: safeColor(theme.colors.text.primary, '1F2937'),
        fill: safeColor(theme.colors.surface, 'F8FAFC'),
        border: { pt: 1, color: safeColor(theme.colors.borders?.medium, 'E5E7EB') },
        rowH: 0.4,
        colW: [2, 2, 2] // Adjust based on content
      });
    } catch (error) {
      // Fallback to content slide
      addContentSlide(slide, spec, theme);
    }
  }
}

/**
 * Parse table data from bullet points
 */
function parseTableDataFromBullets(bullets: string[]): any[][] {
  const tableData: any[][] = [];

  // Add header row
  tableData.push(['Item', 'Value', 'Description']);

  bullets.forEach((bullet, index) => {
    const parts = bullet.split(':');
    if (parts.length >= 2) {
      const item = parts[0].trim();
      const rest = parts.slice(1).join(':').trim();
      const valueMatch = rest.match(/(\d+(?:\.\d+)?(?:%|k|m|b)?)/i);
      const value = valueMatch ? valueMatch[1] : 'N/A';
      const description = rest.replace(valueMatch?.[0] || '', '').trim() || 'No description';

      tableData.push([item, value, description]);
    } else {
      tableData.push([`Item ${index + 1}`, 'N/A', bullet]);
    }
  });

  return tableData;
}

/**
 * Add two-column slide layout
 */
function addTwoColumnSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const contentArea = getContentArea();
  const { typography, spacing } = DEFAULT_LAYOUT;

  // Title
  slide.addText(spec.title || 'Two Column Layout', {
    x: contentArea.x,
    y: contentArea.y,
    w: contentArea.width,
    h: 0.8,
    fontSize: typography.title.fontSize,
    fontFace: theme.typography.headings.fontFamily,
    color: safeColor(theme.colors.text.primary, '1F2937'),
    bold: true,
    valign: 'middle'
  });

  const columnWidth = (contentArea.width - spacing.columnGap) / 2;
  let currentY = contentArea.y + 0.8 + spacing.titleToContent;

  // Left column - paragraph content
  if (spec.paragraph) {
    slide.addText(spec.paragraph, {
      x: contentArea.x,
      y: currentY,
      w: columnWidth,
      h: 3,
      fontSize: typography.body.fontSize,
      fontFace: theme.typography.body.fontFamily,
      color: safeColor(theme.colors.text.primary, '1F2937'),
      valign: 'top'
    });
  }

  // Right column - bullet points
  if (spec.bullets && spec.bullets.length > 0) {
    const bulletText = spec.bullets.map(bullet => `• ${bullet}`).join('\n');
    slide.addText(bulletText, {
      x: contentArea.x + columnWidth + spacing.columnGap,
      y: currentY,
      w: columnWidth,
      h: 3,
      fontSize: typography.bullets.fontSize,
      fontFace: theme.typography.body.fontFamily,
      color: safeColor(theme.colors.text.primary, '1F2937'),
      valign: 'top'
    });
  }
}

/**
 * Add image slide with text content
 */
function addImageSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const contentArea = getContentArea();
  const { typography, spacing } = DEFAULT_LAYOUT;

  // Title
  slide.addText(spec.title || 'Image Slide', {
    x: contentArea.x,
    y: contentArea.y,
    w: contentArea.width,
    h: 0.8,
    fontSize: typography.title.fontSize,
    fontFace: theme.typography.headings.fontFamily,
    color: safeColor(theme.colors.text.primary, '1F2937'),
    bold: true,
    valign: 'middle'
  });

  const imageWidth = contentArea.width * 0.4;
  const textWidth = contentArea.width * 0.55;
  const gap = contentArea.width * 0.05;
  let currentY = contentArea.y + 0.8 + spacing.titleToContent;

  // Image placeholder (left or right based on layout)
  const imageX = spec.layout === 'image-right' ? contentArea.x + textWidth + gap : contentArea.x;
  const textX = spec.layout === 'image-right' ? contentArea.x : contentArea.x + imageWidth + gap;

  // Add image placeholder
  slide.addShape('rect', {
    x: imageX,
    y: currentY,
    w: imageWidth,
    h: 2.5,
    fill: { color: safeColor(theme.colors.surface, 'F3F4F6') },
    line: { color: safeColor(theme.colors.borders?.medium, 'E5E7EB'), width: 1 }
  });

  // Add image placeholder text
  slide.addText('Image Placeholder', {
    x: imageX,
    y: currentY + 1,
    w: imageWidth,
    h: 0.5,
    fontSize: 14,
    fontFace: theme.typography.body.fontFamily,
    color: safeColor(theme.colors.text.secondary, '6B7280'),
    align: 'center',
    valign: 'middle'
  });

  // Add text content
  let textContent = '';
  if (spec.paragraph) textContent += spec.paragraph;
  if (spec.bullets && spec.bullets.length > 0) {
    if (textContent) textContent += '\n\n';
    textContent += spec.bullets.map(bullet => `• ${bullet}`).join('\n');
  }

  if (textContent) {
    slide.addText(textContent, {
      x: textX,
      y: currentY,
      w: textWidth,
      h: 2.5,
      fontSize: typography.body.fontSize,
      fontFace: theme.typography.body.fontFamily,
      color: safeColor(theme.colors.text.primary, '1F2937'),
      valign: 'top'
    });
  }
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
 * Add subtle background pattern to slides
 */
function addBackgroundPattern(slide: any, theme: ProfessionalTheme) {
  // Add subtle geometric pattern in the corner
  const patternSize = 0.3;
  const patternX = SLIDE_DIMENSIONS.width - patternSize - 0.2;
  const patternY = SLIDE_DIMENSIONS.height - patternSize - 0.2;

  // Create a subtle pattern using shapes
  for (let i = 0; i < 3; i++) {
    slide.addShape('circle', {
      x: patternX + (i * 0.08),
      y: patternY + (i * 0.08),
      w: 0.06,
      h: 0.06,
      fill: {
        color: safeColor(theme.colors.accent, 'F59E0B'),
        transparency: 85 + (i * 5) // Increasing transparency
      },
      line: { width: 0 }
    });
  }
}

/**
 * Add decorative elements based on slide type
 */
function addDecorativeElements(slide: any, theme: ProfessionalTheme, slideType: 'title' | 'content' | 'chart' | 'table') {
  switch (slideType) {
    case 'title':
      // Add corner accent
      slide.addShape('rect', {
        x: 0,
        y: 0,
        w: 0.3,
        h: 0.05,
        fill: { color: safeColor(theme.colors.primary, '3B82F6') }
      });
      break;

    case 'content':
      // Add side accent bar
      slide.addShape('rect', {
        x: 0,
        y: 1,
        w: 0.02,
        h: 3,
        fill: { color: safeColor(theme.colors.accent, 'F59E0B') }
      });
      break;

    case 'chart':
      // Add data visualization accent
      slide.addShape('rect', {
        x: SLIDE_DIMENSIONS.width - 0.1,
        y: 0.5,
        w: 0.05,
        h: 2,
        fill: {
          type: 'gradient',
          angle: 90,
          colors: [
            { color: safeColor(theme.colors.primary, '3B82F6'), position: 0 },
            { color: safeColor(theme.colors.accent, 'F59E0B'), position: 100 }
          ]
        }
      });
      break;

    case 'table':
      // Add structured data accent
      slide.addShape('rect', {
        x: 0.1,
        y: SLIDE_DIMENSIONS.height - 0.1,
        w: 2,
        h: 0.05,
        fill: { color: safeColor(theme.colors.secondary, '10B981') }
      });
      break;
  }
}

/**
 * Add professional footer with slide number and branding
 */
function addProfessionalFooter(slide: any, theme: ProfessionalTheme, slideIndex: number, totalSlides: number) {
  const footerY = SLIDE_DIMENSIONS.height - 0.3;

  // Footer background
  slide.addShape('rect', {
    x: 0,
    y: footerY,
    w: SLIDE_DIMENSIONS.width,
    h: 0.3,
    fill: {
      color: safeColor(theme.colors.surface, 'F8FAFC'),
      transparency: 50
    },
    line: {
      color: safeColor(theme.colors.borders?.light, 'F3F4F6'),
      width: 0.5
    }
  });

  // Slide number
  slide.addText(`${slideIndex + 1} / ${totalSlides}`, {
    x: SLIDE_DIMENSIONS.width - 1,
    y: footerY + 0.05,
    w: 0.8,
    h: 0.2,
    fontSize: 10,
    fontFace: theme.typography.body.fontFamily,
    color: safeColor(theme.colors.text.secondary, '6B7280'),
    align: 'right',
    valign: 'middle'
  });

  // Brand accent
  slide.addShape('rect', {
    x: 0.2,
    y: footerY + 0.1,
    w: 0.5,
    h: 0.02,
    fill: { color: safeColor(theme.colors.accent, 'F59E0B') }
  });
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

  // Validate each slide specification
  const validationErrors: string[] = [];
  specs.forEach((spec, index) => {
    if (!spec.title || spec.title.trim().length === 0) {
      validationErrors.push(`Slide ${index + 1}: Title is required`);
    }
    if (spec.title && spec.title.length > 120) {
      validationErrors.push(`Slide ${index + 1}: Title too long (maximum 120 characters)`);
    }
    if (!spec.layout) {
      validationErrors.push(`Slide ${index + 1}: Layout is required`);
    }
    if (spec.bullets && spec.bullets.length > 10) {
      validationErrors.push(`Slide ${index + 1}: Too many bullet points (maximum 10)`);
    }
    if (spec.paragraph && spec.paragraph.length > 2000) {
      validationErrors.push(`Slide ${index + 1}: Paragraph too long (maximum 2000 characters)`);
    }
  });

  if (validationErrors.length > 0) {
    throw new Error(`Validation failed:\n${validationErrors.join('\n')}`);
  }

  logger.info(`Starting enhanced PowerPoint generation for ${specs.length} slides`, context, {
    themeId: themeId || 'corporate-blue',
    options
  });

  try {
    // Initialize presentation with enhanced settings
    const pres = new pptxgen();
    pres.defineLayout({ name: 'LAYOUT_16x9', width: 10, height: 5.63 });
    pres.layout = 'LAYOUT_16x9';

    // Get and validate theme
    const theme = themeId ? getThemeById(themeId) : getThemeById('corporate-blue');
    if (!theme) {
      logger.warn(`Theme not found: ${themeId}, using default`, context);
      const defaultTheme = getThemeById('corporate-blue');
      if (!defaultTheme) {
        throw new Error('Default theme not available');
      }
    }

    // Set comprehensive presentation properties
    if (options.includeMetadata !== false) {
      const metadata = generateMetadata(specs, options);
      pres.author = metadata.author;
      pres.company = metadata.company;
      pres.subject = metadata.subject;
      pres.title = metadata.title;
      pres.revision = '1';
      pres.rtlMode = false;

      logger.info('Presentation metadata set', context, {
        title: metadata.title,
        slideCount: metadata.slideCount,
        estimatedReadingTime: metadata.estimatedReadingTime
      });
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

        // Set professional background
        slide.background = { color: safeColor(theme!.colors.background, 'FFFFFF') };

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

        // Add professional footer
        try {
          addProfessionalFooter(slide, theme!, index, specs.length);
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

    // Generate buffer with enhanced options
    logger.info('Generating PowerPoint buffer', context);
    const exportOptions = {
      outputType: 'nodebuffer' as const,
      compression: options.optimizeFileSize !== false,
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
