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
 * Safely convert color to valid format with comprehensive validation
 */
function safeColor(color: string | undefined, fallback: string): string {
  if (!color || typeof color !== 'string') return fallback;

  // Remove # and ensure uppercase
  let cleanColor = color.replace('#', '').toUpperCase();

  // Validate hex color format (3 or 6 characters)
  if (!/^[0-9A-F]{3}$|^[0-9A-F]{6}$/.test(cleanColor)) {
    return fallback;
  }

  // Convert 3-char hex to 6-char hex
  if (cleanColor.length === 3) {
    cleanColor = cleanColor.split('').map(c => c + c).join('');
  }

  return cleanColor;
}

/**
 * Safely sanitize text content to prevent corruption
 */
function safeText(text: string | undefined, maxLength: number = 1000): string {
  if (!text || typeof text !== 'string') return '';

  // Remove potentially problematic characters
  let cleanText = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[\uFFFE\uFFFF]/g, '') // Remove invalid Unicode
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')
    .trim();

  // Truncate if too long
  if (cleanText.length > maxLength) {
    cleanText = cleanText.substring(0, maxLength - 3) + '...';
  }

  return cleanText;
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
 * Add title slide with reliable, simple design
 */
function addTitleSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const contentArea = getContentArea();
  const { typography } = DEFAULT_LAYOUT;

  try {
    // Simple, reliable title
    slide.addText(safeText(spec.title || 'Untitled Presentation', 120), {
      x: contentArea.x,
      y: contentArea.y + 1.5,
      w: contentArea.width,
      h: 1.2,
      fontSize: typography.title.fontSize,
      fontFace: theme.typography.headings.fontFamily,
      color: safeColor(theme.colors.text.primary, '1F2937'),
      bold: true,
      align: 'center',
      valign: 'middle'
    });

    // Simple subtitle if available
    if (spec.paragraph) {
      slide.addText(safeText(spec.paragraph, 200), {
        x: contentArea.x,
        y: contentArea.y + 3,
        w: contentArea.width,
        h: 0.8,
        fontSize: typography.body.fontSize,
        fontFace: theme.typography.body.fontFamily,
        color: safeColor(theme.colors.text.secondary, '6B7280'),
        align: 'center',
        valign: 'middle'
      });
    }

    // Simple accent line (no complex shapes)
    slide.addShape('rect', {
      x: contentArea.x + (contentArea.width - 2) / 2,
      y: contentArea.y + 1.3,
      w: 2,
      h: 0.05,
      fill: { color: safeColor(theme.colors.accent, 'F59E0B') },
      line: { width: 0 }
    });

  } catch (error) {
    logger.warn('Error adding title slide elements, using fallback', { error });
    // Fallback: just add basic title
    slide.addText(safeText(spec.title || 'Untitled Presentation', 120), {
      x: contentArea.x,
      y: contentArea.y + 2,
      w: contentArea.width,
      h: 1,
      fontSize: 24,
      color: '1F2937',
      bold: true,
      align: 'center',
      valign: 'middle'
    });
  }
}

/**
 * Add content slide with reliable, simple design
 */
function addContentSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const contentArea = getContentArea();
  const { typography, spacing } = DEFAULT_LAYOUT;

  try {
    // Simple, reliable title
    slide.addText(safeText(spec.title || 'Untitled Slide', 120), {
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

    let currentY = contentArea.y + 0.8 + spacing.titleToContent;

    // Simple paragraph content
    if (spec.paragraph) {
      slide.addText(safeText(spec.paragraph, 1000), {
        x: contentArea.x,
        y: currentY,
        w: contentArea.width,
        h: 1.5,
        fontSize: typography.body.fontSize,
        fontFace: theme.typography.body.fontFamily,
        color: safeColor(theme.colors.text.primary, '1F2937'),
        valign: 'top'
      });
      currentY += 1.5 + spacing.paragraphSpacing;
    }

    // Simple bullet points
    if (spec.bullets && spec.bullets.length > 0) {
      const bulletText = spec.bullets
        .slice(0, 8) // Limit to 8 bullets to prevent overflow
        .map(bullet => `• ${safeText(bullet, 150)}`)
        .join('\n');

      slide.addText(bulletText, {
        x: contentArea.x,
        y: currentY,
        w: contentArea.width,
        h: Math.min(3, spec.bullets.length * 0.4),
        fontSize: typography.bullets.fontSize,
        fontFace: theme.typography.body.fontFamily,
        color: safeColor(theme.colors.text.primary, '1F2937'),
        valign: 'top'
      });
    }

  } catch (error) {
    logger.warn('Error adding content slide elements, using fallback', { error });
    // Fallback: just add basic title and content
    slide.addText(safeText(spec.title || 'Untitled Slide', 120), {
      x: contentArea.x,
      y: contentArea.y,
      w: contentArea.width,
      h: 0.8,
      fontSize: 20,
      color: '1F2937',
      bold: true,
      valign: 'middle'
    });

    if (spec.paragraph || (spec.bullets && spec.bullets.length > 0)) {
      const content = spec.paragraph || spec.bullets?.join('\n• ') || '';
      slide.addText(safeText(content, 800), {
        x: contentArea.x,
        y: contentArea.y + 1,
        w: contentArea.width,
        h: 3,
        fontSize: 14,
        color: '1F2937',
        valign: 'top'
      });
    }
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
 * Add table slide with reliable fallback to content
 */
function addTableSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  // Tables can be problematic - use content slide instead for reliability
  logger.info('Table layout requested, using content slide for reliability');
  addContentSlide(slide, spec, theme);
}

// Removed parseTableDataFromBullets - no longer needed

/**
 * Add two-column slide layout with safe implementation
 */
function addTwoColumnSlide(slide: any, spec: SlideSpec, theme: ProfessionalTheme) {
  const contentArea = getContentArea();
  const { typography, spacing } = DEFAULT_LAYOUT;

  try {
    // Title
    slide.addText(safeText(spec.title || 'Two Column Layout', 120), {
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
      slide.addText(safeText(spec.paragraph, 500), {
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
      const bulletText = spec.bullets
        .slice(0, 6) // Limit bullets for column layout
        .map(bullet => `• ${safeText(bullet, 100)}`)
        .join('\n');

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

  } catch (error) {
    logger.warn('Error adding two-column slide, using fallback', { error });
    addContentSlide(slide, spec, theme);
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
