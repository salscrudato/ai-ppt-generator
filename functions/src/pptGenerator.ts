/**
 * Enhanced PowerPoint Generator Service with Comprehensive Layout Support
 *
 * Creates professional .pptx files with advanced styling, comprehensive layout support,
 * and AI image integration. Applies UI/UX best practices for clean, impactful slides.
 *
 * Enhanced Features:
 * - 22+ layout types with intelligent content placement
 * - Advanced chart and data visualization support
 * - Timeline and process flow layouts
 * - Comparison tables and metrics display
 * - AI-generated image integration via imageService (DALL·E 3) with error handling
 * - Professional theme system with brand customization
 * - Dynamic positioning and responsive sizing
 * - Enhanced typography and visual hierarchy
 * - Robust error handling and fallback mechanisms
 *
 * @version 3.4.2-enhanced-fixed
 * @author AI PowerPoint Generator Team
 */

import PptxGenJS from 'pptxgenjs';
type PptxSlide = PptxGenJS.Slide;
import type { SlideSpec } from './schema';
import {
  getThemeById,
  selectThemeForContent,
  customizeTheme,
  type ProfessionalTheme
} from './professionalThemes';
import { ModernTheme, getModernTheme, MODERN_THEMES } from './core/theme/modernThemes';
import { LAYOUT_CONSTANTS, SLIDE_DIMENSIONS, TYPOGRAPHY_CONSTANTS } from './constants/layoutConstants';
import {
  createModernHeroSlide,
  createModernContentSlide,
  createModernMetricsSlide,
  createAdvancedHeroSlide,
  createFeatureShowcaseSlide,
  createTestimonialSlide
} from './slides/modernSlideGenerators';

import { ImageProcessor, createImageProcessorConfig } from './core/imageProcessor';
import {
  generateContextualNotes,
  generatePresentationSummary,
  type SpeakerNotesConfig
} from './core/speakerNotes';
import {
  generatePresentationMetadata,
  applyMetadataToPresentation,
  type MetadataConfig
} from './core/documentMetadata';

import { applyEnhancedBackground } from './core/theme/enhancedBackgrounds';

import {
  textStyleToPptOptions,
  createTypographyTheme,
  createTypographyHierarchy
} from './core/theme/enhancedTypography';

import {
  createEnhancedColorPalette,
  getContextualColor
} from './core/theme/advancedColorManagement';

import {
  chartStyleToPptOptions,
  createBusinessContextChartStyle
} from './core/theme/enhancedChartStyling';

// Enhanced table styling imports removed - not currently used

import {
  calculateSlideLayout,
  applyResponsiveAdjustments
} from './core/enhancedSlideLayoutEngine';

import {
  createStandardizedMeasurements,
  createFontMapping,
  calculateAlignedLayout,
  validateAlignment
} from './core/previewExportAlignment';

import {
  clearAllCaches,
  getCacheStatistics
} from './core/performanceOptimization';

import {
  createEnhancedChart,
  createEnhancedTable
} from './core/theme/enhancedCharts';

// Chart and table generation imports removed - not currently used

import { validateSlideStyle, type StyleValidationResult } from './styleValidator';

/* -------------------------------------------------------
 * Utilities
 * -----------------------------------------------------*/

/** Safe color formatting - removes #, validates hex, returns 6-char uppercase */
function safeColorFormat(color: string): string {
  if (!color) return '000000';
  let cleanColor = color.replace('#', '').trim();
  if (/^[0-9A-Fa-f]{3}$/.test(cleanColor)) {
    cleanColor = cleanColor.split('').map(c => c + c).join('');
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanColor)) {
    console.warn(`Invalid color format: ${color}, using default black`);
    return '000000';
  }
  return cleanColor.toUpperCase();
}

/** Determine content density for responsive adjustments */
function determineContentDensity(spec: SlideSpec): 'low' | 'medium' | 'high' {
  let contentScore = 0;
  if (spec.title) contentScore += spec.title.length > 50 ? 2 : 1;
  if (spec.paragraph) contentScore += spec.paragraph.length > 200 ? 3 : 2;
  if (spec.bullets) contentScore += spec.bullets.length * 1.5;
  if (spec.chart) contentScore += 2;
  if (spec.comparisonTable) contentScore += spec.comparisonTable.rows.length * 0.5;
  if (spec.timeline) contentScore += spec.timeline.length * 0.5;
  if (spec.processSteps) contentScore += spec.processSteps.length * 0.5;
  if (spec.left || spec.right) contentScore += 1;
  if (contentScore <= 3) return 'low';
  if (contentScore <= 7) return 'medium';
  return 'high';
}

/** Determine business context from slide content for chart styling */
function determineBusinessContext(
  slide: any,
  chart: any
): 'financial' | 'marketing' | 'operations' | 'executive' | 'technical' {
  const title = slide.title?.toLowerCase?.() || '';
  const chartTitle = chart.title?.toLowerCase?.() || '';
  if (
    title.includes('revenue') || title.includes('profit') || title.includes('cost') ||
    title.includes('budget') || title.includes('financial') || title.includes('roi') ||
    chartTitle.includes('revenue') || chartTitle.includes('profit') || chartTitle.includes('cost')
  ) return 'financial';

  if (
    title.includes('marketing') || title.includes('campaign') || title.includes('brand') ||
    title.includes('customer') || title.includes('engagement') || title.includes('conversion') ||
    chartTitle.includes('marketing') || chartTitle.includes('campaign')
  ) return 'marketing';

  if (
    title.includes('operations') || title.includes('process') || title.includes('efficiency') ||
    title.includes('production') || title.includes('workflow') || title.includes('performance') ||
    chartTitle.includes('operations') || chartTitle.includes('process')
  ) return 'operations';

  if (
    title.includes('technical') || title.includes('system') || title.includes('data') ||
    title.includes('analytics') || title.includes('metrics') || title.includes('kpi') ||
    chartTitle.includes('technical') || chartTitle.includes('system')
  ) return 'technical';

  return 'executive';
}

/** Apply data-driven optimizations to chart style */
function applyDataDrivenOptimizations(chartStyle: any, dataPointCount: number): any {
  const optimizedStyle = { ...chartStyle };
  if (dataPointCount > 10) {
    optimizedStyle.dataLabelStyle!.showValues = false;
    optimizedStyle.legendStyle!.fontSize = Math.max(10, (optimizedStyle.legendStyle!.fontSize ?? 12) - 1);
    optimizedStyle.axisStyle!.fontSize = Math.max(9, (optimizedStyle.axisStyle!.fontSize ?? 11) - 1);
  }
  if (dataPointCount > 20) {
    optimizedStyle.shadow!.enabled = false;
    optimizedStyle.borderRadius = 2;
    optimizedStyle.legendStyle!.position = 'bottom';
  }
  if (dataPointCount > 50) {
    optimizedStyle.dataLabelStyle!.showValues = false;
    optimizedStyle.dataLabelStyle!.showPercentages = false;
    optimizedStyle.legendStyle!.fontSize = Math.max(8, (optimizedStyle.legendStyle!.fontSize ?? 10) - 2);
  }
  return optimizedStyle;
}

/** Determine table context for optimal styling */
function determineTableContext(_table: any): 'financial' | 'comparison' | 'data' | 'summary' | 'timeline' {
  const headers = _table.headers || [];
  const headerText = headers.join(' ').toLowerCase();
  if (
    headerText.includes('revenue') || headerText.includes('cost') || headerText.includes('profit') ||
    headerText.includes('budget') || headerText.includes('price') || headerText.includes('$') ||
    headerText.includes('financial') || headerText.includes('roi')
  ) return 'financial';

  if (
    headerText.includes('vs') || headerText.includes('comparison') || headerText.includes('before') ||
    headerText.includes('after') || headerText.includes('option') || headerText.includes('plan') ||
    (headers.length >= 3 && headers.some((h: string) => h.toLowerCase().includes('feature')))
  ) return 'comparison';

  if (
    headerText.includes('date') || headerText.includes('time') || headerText.includes('year') ||
    headerText.includes('month') || headerText.includes('quarter') || headerText.includes('phase') ||
    headerText.includes('milestone') || headerText.includes('timeline')
  ) return 'timeline';

  if (headerText.includes('summary') || headerText.includes('total') || headerText.includes('overview') || _table.rows.length <= 5) {
    return 'summary';
  }
  return 'data';
}

/** Sanitize slide spec to prevent corruption */
function sanitizeSlideSpec(spec: SlideSpec): SlideSpec {
  const sanitized: SlideSpec = {
    ...spec,
    title: sanitizeText(spec.title || 'Untitled Slide', 100),
    paragraph: spec.paragraph ? sanitizeText(spec.paragraph, 2000) : undefined,
    bullets: spec.bullets?.map(b => sanitizeText(b, 500)).filter(Boolean),
    notes: spec.notes ? sanitizeText(spec.notes, 3000) : undefined,
    imagePrompt: spec.imagePrompt ? sanitizeText(spec.imagePrompt, 1000) : undefined
  };

  if (spec.left) {
    sanitized.left = {
      ...spec.left,
      heading: spec.left.heading ? sanitizeText(spec.left.heading, 80) : undefined,
      paragraph: spec.left.paragraph ? sanitizeText(spec.left.paragraph, 1000) : undefined,
      bullets: spec.left.bullets?.map(b => sanitizeText(b, 500)).filter(Boolean),
      imagePrompt: spec.left.imagePrompt ? sanitizeText(spec.left.imagePrompt, 1000) : undefined
    };
  }
  if (spec.right) {
    sanitized.right = {
      ...spec.right,
      heading: spec.right.heading ? sanitizeText(spec.right.heading, 80) : undefined,
      paragraph: spec.right.paragraph ? sanitizeText(spec.right.paragraph, 1000) : undefined,
      bullets: spec.right.bullets?.map(b => sanitizeText(b, 500)).filter(Boolean),
      imagePrompt: spec.right.imagePrompt ? sanitizeText(spec.right.imagePrompt, 1000) : undefined
    };
  }
  return sanitized;
}

/** Sanitize text */
function sanitizeText(text: string, maxLength: number = 1000): string {
  if (!text) return '';
  let sanitized = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[\uFEFF\uFFFE\uFFFF]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
  if (sanitized.length > maxLength) sanitized = sanitized.substring(0, maxLength - 3) + '...';
  return sanitized;
}

/** Decide modern vs traditional theme */
function shouldUseModernTheme(spec: SlideSpec): boolean {
  if (spec.design?.modern === true) return true;
  if (spec.design?.theme && MODERN_THEMES.some(t => t.id === spec.design?.theme)) return true;
  if (spec.design?.style === 'modern') return true;
  const modernLayouts = ['hero', 'metrics-dashboard', 'feature-showcase', 'testimonial-card'];
  return modernLayouts.includes(spec.layout);
}
function isModernTheme(theme: ProfessionalTheme | ModernTheme): theme is ModernTheme {
  return 'gradients' in theme;
}
function getAppropriateTheme(spec: SlideSpec): ProfessionalTheme | ModernTheme {
  if (shouldUseModernTheme(spec)) {
    const modernThemeId = spec.design?.theme;
    if (modernThemeId) {
      const modernTheme = getModernTheme(modernThemeId);
      if (modernTheme) return modernTheme;
    }
    return MODERN_THEMES[0];
  }
  let theme =
    getThemeById(spec.design?.theme || '') ||
    selectThemeForContent({ presentationType: spec.layout, tone: 'professional' });

  if (!theme) {
    theme = selectThemeForContent({ presentationType: 'business', tone: 'professional' });
  }
  if (spec.design?.brand) {
    theme = customizeTheme(theme, {
      primary: spec.design.brand.primary,
      secondary: spec.design.brand.secondary,
      accent: spec.design.brand.accent,
      fontFamily: spec.design.brand.fontFamily
    });
  }
  return theme;
}

/** Determine presentation type (for image processor config) */
function determinePresentationType(
  specs: SlideSpec[]
): 'business' | 'creative' | 'academic' | 'technical' {
  const keywords = specs
    .flatMap(spec => [spec.title?.toLowerCase() || '', spec.bullets?.join(' ').toLowerCase() || '', spec.paragraph?.toLowerCase() || ''])
    .join(' ');
  if (keywords.includes('research') || keywords.includes('study') || keywords.includes('analysis')) return 'academic';
  if (keywords.includes('technical') || keywords.includes('development') || keywords.includes('engineering')) return 'technical';
  if (keywords.includes('creative') || keywords.includes('design') || keywords.includes('art')) return 'creative';
  return 'business';
}

/* -------------------------------------------------------
 * Public API
 * -----------------------------------------------------*/

/**
 * Generate a PowerPoint file buffer from slide specifications
 * Enhanced with style validation and quality assurance
 *
 * @param specs - Array of slide specifications
 * @param validateStyles - Whether to perform style validation (default: true)
 * @returns Promise<Buffer> - PowerPoint file buffer
 */
export async function generatePpt(specs: SlideSpec[], validateStyles: boolean = true): Promise<Buffer> {
  const startTime = Date.now();
  const memoryBefore = process.memoryUsage?.() || { heapUsed: 0 };

  console.log('🎯 generatePpt called with specs:', {
    specsCount: specs.length,
    memoryUsage: `${Math.round((memoryBefore.heapUsed || 0) / 1024 / 1024)}MB`,
    specs: specs.map(spec => ({
      title: spec.title,
      layout: spec.layout,
      hasParagraph: !!spec.paragraph,
      paragraph: spec.paragraph?.substring(0, 100) + (spec.paragraph && spec.paragraph.length > 100 ? '...' : ''),
      hasBullets: !!spec.bullets,
      bulletsCount: spec.bullets?.length,
      hasImagePrompt: !!spec.imagePrompt,
      hasLeft: !!spec.left,
      hasRight: !!spec.right
    }))
  });

  // Validate input
  if (!Array.isArray(specs)) throw new Error('Slide specifications must be an array');
  if (specs.length === 0) throw new Error('No slide specifications provided');
  if (specs.length > 100) throw new Error('Too many slides (maximum 100 allowed to prevent memory issues)');

  // Sanitize
  const sanitizedSpecs: SlideSpec[] = [];
  const validationErrors: string[] = [];
  for (let i = 0; i < specs.length; i++) {
    try {
      const sanitized = sanitizeSlideSpec(specs[i]);
      if (!sanitized.title?.trim()) {
        validationErrors.push(`Slide ${i + 1}: Missing or empty title`);
        sanitized.title = `Slide ${i + 1}`;
      }
      if (!sanitized.layout) {
        validationErrors.push(`Slide ${i + 1}: Missing layout, using default`);
        sanitized.layout = 'title-bullets';
      }
      sanitizedSpecs.push(sanitized);
    } catch (err) {
      const errorMsg = `Slide ${i + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`;
      validationErrors.push(errorMsg);
      console.error('❌ Slide validation error:', errorMsg);
    }
  }
  if (validationErrors.length > 0) console.warn('⚠️ Validation warnings:', validationErrors);
  if (sanitizedSpecs.length === 0) throw new Error('No valid slide specifications after sanitization');

  console.log(`✅ Validated and sanitized ${sanitizedSpecs.length} slide specifications`);

  // Initialize presentation
  let pres: PptxGenJS;
  try {
    pres = new PptxGenJS();
    pres.layout = 'LAYOUT_WIDE'; // 16:9
    console.log('✅ PowerPoint presentation initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize PowerPoint presentation:', error);
    throw new Error(`PowerPoint initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Metadata
  const metadataConfig: MetadataConfig = {
    author: 'AI PowerPoint Generator',
    company: 'Professional Presentations',
    department: 'AI Generated Content',
    project: 'Professional Presentation',
    confidentialityLevel: 'internal',
    status: 'draft',
    includeAnalytics: true,
    includeAccessibilityInfo: true,
    customProperties: {
      'Generator-Version': '2.0.0',
      'Quality-Assurance': 'Automated',
      'Template-System': 'Slide Masters'
    }
  };

  const masterTheme: ProfessionalTheme | ModernTheme =
    sanitizedSpecs.length > 0
      ? getAppropriateTheme(sanitizedSpecs[0])
      : getModernTheme('minimal') || selectThemeForContent({ presentationType: 'business', tone: 'professional' });

  const presentationMetadata = generatePresentationMetadata(sanitizedSpecs, masterTheme, metadataConfig);

  // Image processor
  const presentationType = determinePresentationType(sanitizedSpecs);
  const imageProcessorConfig = createImageProcessorConfig(presentationType, 'balanced');
  const imageProcessor = new ImageProcessor(imageProcessorConfig);
  console.log(`🖼️ Initialized image processor for ${presentationType} presentation`);

  // Apply metadata
  applyMetadataToPresentation(pres, presentationMetadata);

  // Masters currently disabled to avoid corruption (see notes)
  console.log('⚠️ Slide masters temporarily disabled to prevent corruption');

  const validationResults: StyleValidationResult[] = [];
  const slideGenerationErrors: string[] = [];

  for (let i = 0; i < sanitizedSpecs.length; i++) {
    const spec = sanitizedSpecs[i];
    try {
      console.log(`🔨 Processing slide ${i + 1}/${sanitizedSpecs.length}: "${spec.title}"`);
      const theme = getAppropriateTheme(spec);
      const useModernTheme = isModernTheme(theme);

      // Optional style validation
      if (validateStyles) {
        try {
          if (!useModernTheme) {
            const styleValidation = validateSlideStyle(spec, theme as ProfessionalTheme);
            validationResults.push(styleValidation);
            if (styleValidation.issues.length > 0) {
              console.log(`Style validation for slide "${spec.title}":`, {
                score: styleValidation.score,
                grade: styleValidation.grade,
                issues: styleValidation.issues.map(i => i.message)
              });
            }
          } else {
            console.log(`✅ Processing slide "${spec.title}" with theme ${theme.id}`);
            if (spec.title && spec.title.length > 100) {
              console.warn(`⚠️ Title too long for slide "${spec.title}"`);
            }
            if (spec.bullets && spec.bullets.length > 8) {
              console.warn(`⚠️ Too many bullet points (${spec.bullets.length}) for slide "${spec.title}"`);
            }
          }
        } catch (styleError) {
          console.warn(`⚠️ Style validation failed for slide ${i + 1}:`, styleError);
        }
      }

      const slide = pres.addSlide();

      // Modern slide variants
      if (useModernTheme) {
        const modernTheme = theme;

        if (spec.layout === 'title' || spec.layout === 'hero') {
          createModernHeroSlide(
            slide,
            {
              title: spec.title,
              subtitle: spec.paragraph,
              author: spec.design?.author,
              date: spec.design?.date,
              backgroundStyle: (spec.design?.backgroundStyle as any) || 'minimal'
            },
            modernTheme
          );
          continue;
        } else if (spec.layout === 'gradient-hero') {
          createAdvancedHeroSlide(
            slide,
            {
              title: spec.title,
              subtitle: spec.paragraph,
              callToAction: 'Learn More',
              backgroundStyle: 'gradient'
            },
            modernTheme
          );
          continue;
        } else if (spec.layout === 'feature-showcase') {
          const features =
            spec.bullets?.map((bullet, index) => ({
              icon: '⭐',
              title: `Feature ${index + 1}`,
              description: bullet,
              color: modernTheme.palette.accent
            })) || [];
          createFeatureShowcaseSlide(
            slide,
            { title: spec.title, features, layout: 'grid' },
            modernTheme
          );
          continue;
        } else if (spec.layout === 'testimonial-card') {
          createTestimonialSlide(
            slide,
            {
              title: spec.title,
              quote: spec.paragraph || 'This is an amazing product that has transformed our business.',
              author: spec.design?.author || 'John Doe',
              role: 'CEO',
              company: 'Example Corp'
            },
            modernTheme
          );
          continue;
        } else if (spec.layout === 'metrics-dashboard' && spec.bullets) {
          const metrics = spec.bullets.map((bullet, index) => ({
            value: `${index + 1}`,
            label: bullet,
            trend: 'neutral' as const
          }));
          createModernMetricsSlide(
            slide,
            { title: spec.title, metrics, layout: 'grid' },
            modernTheme
          );
          continue;
        } else if (spec.bullets || spec.paragraph) {
          const content = spec.bullets || (spec.paragraph ? [spec.paragraph] : []);
          createModernContentSlide(
            slide,
            {
              title: spec.title,
              content,
              layout: (spec.design?.contentLayout as any) || 'bullets',
              accentColor: modernTheme.palette.accent
            },
            modernTheme
          );
          continue;
        }
      }

      // Traditional rendering
      const traditionalTheme = theme as ProfessionalTheme;

      // Simple (safe) slide background if not default white
      const bgColor = safeColorFormat(traditionalTheme.colors.background);
      if (bgColor !== 'FFFFFF') {
        (slide as any).background = { color: bgColor };
      }

      // Title (safe text options)
      const titleY = 0.5;
      const titleHeight = 1.0;
      const titleFontSize = spec.layout === 'title' ? 36 : 24;
      slide.addText(spec.title || 'Untitled Slide', {
        x: LAYOUT_CONSTANTS.CONTENT_PADDING,
        y: titleY,
        w: LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH,
        h: titleHeight,
        fontSize: titleFontSize,
        bold: true,
        color: safeColorFormat(
          (traditionalTheme.colors.text as any)?.primary || traditionalTheme.colors.primary || '000000'
        ),
        align: 'left',
        fontFace: 'Calibri',
        valign: 'top'
      } as any);

      const slideContext = { title: spec.title, layout: spec.layout, index: i, totalSlides: sanitizedSpecs.length };
      await renderSlideLayout(slide, spec, traditionalTheme, imageProcessor, slideContext);

      // Speaker notes
      const speakerNotesConfig: SpeakerNotesConfig = {
        includeTransitions: true,
        includeTimingGuidance: true,
        includeEngagementTips: specs.length > 5,
        includeAccessibilityNotes: true,
        verbosityLevel: 'detailed',
        audienceLevel: 'general'
      };
      let notesText = '';
      if (spec.notes && spec.notes.trim()) {
        notesText = spec.notes;
        notesText += '\n\n' + generateContextualNotes(specs, i, {
          ...speakerNotesConfig,
          verbosityLevel: 'concise'
        });
      } else {
        notesText = generateContextualNotes(specs, i, speakerNotesConfig);
      }
      if (spec.sources && spec.sources.length > 0) {
        notesText += '\n\n📚 SOURCES & REFERENCES:\n';
        spec.sources.forEach((source, idx) => {
          notesText += `${idx + 1}. ${source}\n`;
        });
        notesText +=
          '\n💡 TIP: Reference these sources during your presentation to build credibility and provide context.';
      }
      if (i === 0) {
        const presentationSummary = generatePresentationSummary(specs);
        notesText = presentationSummary + '\n\n' + notesText;
      }
      (slide as any).addNotes(notesText);

      // Page numbers / footer
      addPageNumbersAndFooter(slide, i + 1, sanitizedSpecs.length, spec.layout === 'title');
    } catch (error) {
      const errorMsg = `Slide ${i + 1} generation error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      slideGenerationErrors.push(errorMsg);
      console.error('❌', errorMsg);
      try {
        const fallbackSlide = pres.addSlide();
        fallbackSlide.addText(`Error: ${spec.title}`, {
          x: 1, y: 1, w: 8, h: 1, fontSize: 24, bold: true, color: 'FF0000'
        } as any);
        fallbackSlide.addText(`Failed to generate slide content. Error: ${errorMsg}`, {
          x: 1, y: 2, w: 8, h: 2, fontSize: 14, color: '666666'
        } as any);
      } catch (fallbackError) {
        console.error('❌ Failed to create fallback slide:', fallbackError);
      }
    }
  }

  if (slideGenerationErrors.length > 0) {
    console.warn(`⚠️ Slide generation completed with ${slideGenerationErrors.length} errors:`, slideGenerationErrors);
  } else {
    console.log('✅ All slides generated successfully');
  }

  // Write file
  try {
    console.log('🔄 Generating PowerPoint buffer...');
    if (!pres || typeof (pres as any).write !== 'function') throw new Error('Invalid presentation object');

    const writeOptions = {
      outputType: 'nodebuffer'
      // Note: additional flags like compression/rtlMode vary by version; keep minimal for compatibility
    } as any;

    console.log('📝 Writing presentation with options:', writeOptions);
    const buffer: any = await (pres as any).write(writeOptions);

    if (!buffer || !(buffer instanceof Buffer) || buffer.length === 0) {
      throw new Error('Generated buffer is invalid or empty');
    }

    // Optional ZIP signature check
    const signature = buffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]); // "PK\x03\x04"
    if (!signature.equals(expectedSignature)) {
      console.warn('⚠️ Generated file may not have valid PowerPoint signature');
    }

    const fileSizeKB = Math.round(buffer.length / 1024);
    const endTime = Date.now();
    const memoryAfter = process.memoryUsage?.() || { heapUsed: 0 };
    const generationTime = endTime - startTime;
    const memoryUsed = Math.max(0, Math.round(((memoryAfter.heapUsed || 0) - (memoryBefore.heapUsed || 0)) / 1024 / 1024));

    console.log(`✅ PowerPoint buffer generated successfully: ${fileSizeKB}KB`);
    console.log(`📊 Performance metrics:`, {
      generationTime: `${generationTime}ms`,
      memoryUsed: `${memoryUsed}MB`,
      finalMemory: `${Math.round((memoryAfter.heapUsed || 0) / 1024 / 1024)}MB`,
      slidesPerSecond: generationTime > 0 ? Math.round((sanitizedSpecs.length / generationTime) * 1000) : 'n/a'
    });

    if (buffer.length < 1000) {
      console.warn('⚠️ Generated file is suspiciously small, may be corrupted');
    }

    const cacheStats = getCacheStatistics();
    console.log('📊 Enhanced Generation Performance Summary:', {
      duration: `${generationTime}ms`,
      memoryDelta: `${memoryUsed}MB`,
      slidesPerSecond: generationTime > 0 ? (sanitizedSpecs.length / (generationTime / 1000)).toFixed(1) : 'n/a',
      cacheHitRates: cacheStats
        ? {
            color: cacheStats.color ? `${(cacheStats.color.hitRate * 100).toFixed(1)}%` : 'n/a',
            layout: cacheStats.layout ? `${(cacheStats.layout.hitRate * 100).toFixed(1)}%` : 'n/a',
            font: cacheStats.font ? `${(cacheStats.font.hitRate * 100).toFixed(1)}%` : 'n/a',
            theme: cacheStats.theme ? `${(cacheStats.theme.hitRate * 100).toFixed(1)}%` : 'n/a'
          }
        : 'n/a',
      optimizationBenefits: {
        cacheEnabled: true,
        performanceMonitoring: true,
        memoryManagement: true
      }
    });

    if ((memoryAfter.heapUsed || 0) > 100 * 1024 * 1024) {
      if ((global as any).gc) {
        (global as any).gc();
        console.log('🧹 Garbage collection triggered');
      }
    }

    if (sanitizedSpecs.length > 50) {
      console.log('🧹 Clearing caches after large presentation generation');
      clearAllCaches();
    }

    return buffer as Buffer;
  } catch (error) {
    console.error('❌ Failed to generate PowerPoint buffer:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      presentationValid: true,
      slideCount: sanitizedSpecs.length
    });

    if (error instanceof Error) {
      if (error.message.includes('memory') || error.message.includes('heap')) {
        throw new Error(`PowerPoint generation failed due to memory constraints: ${error.message}`);
      } else if (error.message.includes('timeout')) {
        throw new Error(`PowerPoint generation timed out: ${error.message}`);
      } else {
        throw new Error(`PowerPoint generation failed: ${error.message}`);
      }
    } else {
      throw new Error('PowerPoint generation failed due to unknown error');
    }
  }
}

/* -------------------------------------------------------
 * Rendering helpers
 * -----------------------------------------------------*/

async function renderSlideLayout(
  slide: PptxSlide,
  spec: SlideSpec,
  theme: ProfessionalTheme,
  imageProcessor?: ImageProcessor,
  slideContext?: { title: string; layout: string; index: number; totalSlides: number }
): Promise<void> {
  console.log('🎯 renderSlideLayout', {
    title: spec.title,
    layout: spec.layout,
    hasBullets: !!spec.bullets,
    bulletsCount: spec.bullets?.length,
    hasRightImage: !!spec.right?.imagePrompt,
    hasLeftImage: !!spec.left?.imagePrompt
  });

  // Themed background overlays, watermarks, etc. (safe async application)
  // Map theme category to valid BackgroundStyle
  const backgroundStyleMap: Record<string, string> = {
    'corporate': 'professional',
    'creative': 'creative',
    'academic': 'professional',
    'startup': 'modern',
    'healthcare': 'professional',
    'finance': 'professional',
    'consulting': 'professional',
    'technology': 'modern',
    'modern': 'modern',
    'vibrant': 'creative',
    'natural': 'professional'
  };
  const backgroundStyle = backgroundStyleMap[theme.category] || 'professional';
  await applyEnhancedBackground(slide, theme, backgroundStyle as any, (spec.layout === 'title' || spec.layout === 'hero') ? 'title' : 'content');

  const { CONTENT_Y, COLUMN_WIDTH, COLUMN_GAP } = LAYOUT_CONSTANTS;

  // Preview-export alignment (non-fatal diagnostics)
  const standardMeasurements = createStandardizedMeasurements();
  createFontMapping(); // mapping prepared for alignment engine
  const alignedLayouts = calculateAlignedLayout(spec, theme, standardMeasurements);

  const layoutResult = calculateSlideLayout(spec, theme);
  const contentDensity = determineContentDensity(spec);
  const finalLayout = applyResponsiveAdjustments(layoutResult, contentDensity);

  const alignmentValidation = validateAlignment(
    finalLayout.title,
    alignedLayouts.title?.export || finalLayout.title,
    0.01
  );
  if (!alignmentValidation.isAligned) {
    console.log(`📐 Layout alignment recommendations:`, alignmentValidation.recommendations);
  }
  if (finalLayout.recommendations.length > 0) {
    console.log(`📋 Layout recommendations for slide:`, finalLayout.recommendations);
  }

  // Title (enhanced typography)
  if (spec.title) {
    const titlePosition = alignedLayouts.title?.export || finalLayout.title;
    await addEnhancedTitleWithLayout(slide, spec.title, theme, spec.layout, titlePosition);
  }

  switch (spec.layout) {
    case 'title': {
      if (spec.paragraph) {
        slide.addText(spec.paragraph, {
          x: 2.0, y: 2.0, w: 6.0, h: 1.5,
          fontSize: 18,
          color: safeColorFormat(theme.colors.text.secondary),
          align: 'center'
        } as any);
      }
      break;
    }

    case 'title-bullets': {
      if (spec.bullets) addBullets(slide, spec.bullets, theme, LAYOUT_CONSTANTS.CONTENT_PADDING, CONTENT_Y, LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH);
      break;
    }

    case 'title-paragraph': {
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, LAYOUT_CONSTANTS.CONTENT_PADDING, CONTENT_Y, LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH);
      break;
    }

    case 'two-column': {
      const leftX = LAYOUT_CONSTANTS.CONTENT_PADDING;
      const rightX = LAYOUT_CONSTANTS.CONTENT_PADDING + COLUMN_WIDTH + COLUMN_GAP;
      const columnY = CONTENT_Y + 0.6;

      try {
        slide.addShape('rect', {
          x: leftX + COLUMN_WIDTH + (COLUMN_GAP / 2) - 0.025,
          y: columnY - 0.2,
          w: 0.05,
          h: 3.5,
          fill: { color: safeColorFormat(theme.colors.borders?.light || theme.colors.accent), transparency: 70 },
          line: { width: 0 }
        } as any);
      } catch (error) {
        console.warn('⚠️ Failed to add column separator:', error);
      }

      await addColumnBackground(slide, theme, leftX, columnY, COLUMN_WIDTH);
      await addColumnBackground(slide, theme, rightX, columnY, COLUMN_WIDTH);

      if (spec.left) {
        await addColumnContent(slide, spec.left as ExtendedColumnContent, theme, leftX, columnY, COLUMN_WIDTH, false, imageProcessor, slideContext);
      } else {
        addEnhancedBullets(slide, ['Cost effective solution', 'Easy to implement', 'Scalable architecture'], theme, leftX + 0.1, columnY + 0.1, COLUMN_WIDTH - 0.2);
      }
      if (spec.right) {
        await addColumnContent(slide, spec.right as ExtendedColumnContent, theme, rightX, columnY, COLUMN_WIDTH, true, imageProcessor, slideContext);
      } else {
        addEnhancedBullets(slide, ['Initial setup complexity', 'Training requirements', 'Migration timeline'], theme, rightX + 0.1, columnY + 0.1, COLUMN_WIDTH - 0.2);
      }
      break;
    }

    case 'mixed-content': {
      await renderMixedContent(slide, spec, theme, CONTENT_Y, imageProcessor, slideContext);
      break;
    }

    case 'image-right': {
      await renderImageRight(slide, spec, theme, CONTENT_Y, imageProcessor, slideContext);
      break;
    }

    case 'image-left': {
      await renderImageLeft(slide, spec, theme, CONTENT_Y, imageProcessor, slideContext);
      break;
    }

    case 'image-full': {
      await renderImageFull(slide, spec, theme, imageProcessor, slideContext);
      break;
    }

    case 'quote': {
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, 1.0, CONTENT_Y, 8.0, true);
      break;
    }

    case 'chart': {
      if (spec.chart) {
        try {
          const isValidChart = validateChartData(spec.chart);
          if (isValidChart.valid) {
            const chartData = {
              type: spec.chart.type,
              data: spec.chart.series.map(series => ({
                name: series.name,
                labels: spec.chart!.categories,
                values: series.data
              }))
            };
            createEnhancedChart(slide, chartData, { x: 1.0, y: CONTENT_Y, w: 8.0, h: 4.0 }, theme, {
              colorScheme: 'theme',
              showDataLabels: spec.chart.showDataLabels ?? true,
              showLegend: spec.chart.showLegend ?? true,
              showGridlines: true,
              shadowIntensity: 'subtle'
            });
          } else {
            console.warn('Invalid chart data, falling back to text description:', isValidChart.errors);
            renderChartFallback(slide, spec.chart, theme, isValidChart.errors);
          }
        } catch (error) {
          console.error('Chart rendering failed, using fallback:', error);
          renderChartFallback(slide, spec.chart, theme, [`Chart rendering error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
        }
      }
      break;
    }

    case 'comparison-table': {
      if (spec.comparisonTable) {
        createEnhancedTable(
          slide,
          { headers: spec.comparisonTable.headers, rows: spec.comparisonTable.rows },
          { x: 1.0, y: CONTENT_Y, w: 8.0, h: 3.5 },
          theme,
          { headerStyle: 'colored', alternatingRows: true, borderStyle: 'minimal', fontSize: 12, colorScheme: 'theme' }
        );
      }
      break;
    }

    case 'timeline': {
      if (spec.timeline) renderTimeline(slide, spec.timeline, theme, CONTENT_Y);
      break;
    }

    case 'process-flow': {
      if (spec.processSteps) renderProcessFlow(slide, spec.processSteps, theme, CONTENT_Y);
      break;
    }

    case 'before-after':
    case 'problem-solution': {
      await renderBeforeAfter(slide, spec, theme, CONTENT_Y);
      break;
    }

    case 'data-visualization': {
      if (spec.chart) addChart(slide, spec.chart, theme, 1.0, CONTENT_Y, 8.0, 4.0);
      break;
    }

    case 'testimonial': {
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, 1.0, CONTENT_Y, 8.0, true);
      break;
    }

    case 'team-intro':
    case 'contact-info': {
      if (spec.bullets) addBullets(slide, spec.bullets, theme, 1.0, CONTENT_Y, 8.0);
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, 1.0, CONTENT_Y + 0.8, 8.0);
      break;
    }

    case 'agenda': {
      slide.addText('Agenda', {
        x: LAYOUT_CONSTANTS.CONTENT_PADDING,
        y: CONTENT_Y,
        w: LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH,
        h: 0.5,
        fontSize: (theme.typography.headings.sizes as any).h2,
        bold: true,
        color: safeColorFormat(theme.colors.text.primary)
      } as any);
      addModernSeparator(slide, theme, LAYOUT_CONSTANTS.CONTENT_PADDING, CONTENT_Y + 0.6, LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH, 0.04);
      if (spec.bullets) addEnhancedBullets(slide, spec.bullets, theme, LAYOUT_CONSTANTS.CONTENT_PADDING, CONTENT_Y + 0.9, LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH);
      break;
    }

    case 'section-divider': {
      slide.addText(spec.title || 'Section', {
        x: LAYOUT_CONSTANTS.CONTENT_PADDING,
        y: CONTENT_Y + 1.0,
        w: LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH,
        h: 1.0,
        fontSize: Math.min((theme.typography.headings.sizes as any).h1, 40),
        bold: true,
        color: safeColorFormat(theme.colors.primary),
        align: 'center'
      } as any);
      break;
    }

    case 'thank-you': {
      slide.addText('Thank You', {
        x: 0, y: CONTENT_Y + 1.0, w: 10, h: 1.0,
        align: 'center',
        fontSize: (theme.typography.headings.sizes as any).h1,
        bold: true,
        color: safeColorFormat(theme.colors.primary)
      } as any);
      if (spec.paragraph) {
        slide.addText(spec.paragraph, {
          x: 2.0, y: CONTENT_Y + 2.2, w: 6.0, h: 1.5,
          align: 'center',
          fontSize: (theme.typography.body.sizes as any).normal,
          color: safeColorFormat(theme.colors.text.secondary)
        } as any);
      }
      break;
    }

    default: {
      if (spec.bullets) addBullets(slide, spec.bullets, theme, LAYOUT_CONSTANTS.CONTENT_PADDING, CONTENT_Y, LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH);
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, LAYOUT_CONSTANTS.CONTENT_PADDING, CONTENT_Y, LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH);
      break;
    }
  }
}

/* ---------- Specific layout helpers ---------- */

async function renderMixedContent(
  slide: PptxSlide,
  spec: SlideSpec,
  theme: ProfessionalTheme,
  contentY: number,
  imageProcessor?: ImageProcessor,
  slideContext?: { title: string; layout: string; index: number; totalSlides: number }
): Promise<void> {
  let currentY = contentY;
  if (spec.paragraph) {
    addParagraph(slide, spec.paragraph, theme, 0.5, currentY, 4.5);
    currentY += 2.0;
  }
  if (spec.bullets) {
    addBullets(slide, spec.bullets, theme, 0.5, currentY, 4.5);
  }
  if (spec.right?.imagePrompt && spec.right?.generateImage) {
    await addImage(slide, spec.right.imagePrompt, theme, 5.5, contentY, 4.0, 4.0, imageProcessor, slideContext);
  }
}

async function renderImageRight(
  slide: PptxSlide,
  spec: SlideSpec,
  theme: ProfessionalTheme,
  contentY: number,
  imageProcessor?: ImageProcessor,
  slideContext?: { title: string; layout: string; index: number; totalSlides: number }
): Promise<void> {
  let currentY = contentY;
  if (spec.paragraph) {
    addParagraph(slide, spec.paragraph, theme, 0.5, currentY, 4.5);
    currentY += 2.0;
  }
  if (spec.bullets) {
    addBullets(slide, spec.bullets, theme, 0.5, currentY, 4.5);
  }
  if (spec.left && !spec.left.imagePrompt) {
    if (spec.left.paragraph) {
      addParagraph(slide, spec.left.paragraph, theme, 0.5, currentY, 4.5);
      currentY += 1.5;
    }
    if (spec.left.bullets) {
      addBullets(slide, spec.left.bullets, theme, 0.5, currentY, 4.5);
    }
  }

  if (spec.right?.imagePrompt && spec.right?.generateImage) {
    await addImage(slide, spec.right.imagePrompt, theme, 5.5, contentY, 4.0, 4.0, imageProcessor, slideContext);
  } else if (spec.left?.imagePrompt && spec.left.generateImage) {
    await addImage(slide, spec.left.imagePrompt, theme, 5.5, contentY, 4.0, 4.0, imageProcessor, slideContext);
  } else if (spec.imagePrompt && spec.generateImage) {
    await addImage(slide, spec.imagePrompt, theme, 5.5, contentY, 4.0, 4.0, imageProcessor, slideContext);
  }
}

async function renderImageLeft(
  slide: PptxSlide,
  spec: SlideSpec,
  theme: ProfessionalTheme,
  contentY: number,
  imageProcessor?: ImageProcessor,
  slideContext?: { title: string; layout: string; index: number; totalSlides: number }
): Promise<void> {
  let currentY = contentY;
  if (spec.left?.imagePrompt && spec.left.generateImage) {
    await addImage(slide, spec.left.imagePrompt, theme, 0.5, contentY, 4.0, 4.0, imageProcessor, slideContext);
  } else if (spec.right?.imagePrompt && spec.right.generateImage) {
    await addImage(slide, spec.right.imagePrompt, theme, 0.5, contentY, 4.0, 4.0, imageProcessor, slideContext);
  } else if (spec.imagePrompt && spec.generateImage) {
    await addImage(slide, spec.imagePrompt, theme, 0.5, contentY, 4.0, 4.0, imageProcessor, slideContext);
  }

  const rightContent = {
    paragraph: spec.paragraph || spec.right?.paragraph,
    bullets: spec.bullets || spec.right?.bullets,
    heading: spec.right?.heading,
    metrics: spec.right?.metrics
  };
  if (rightContent.paragraph || rightContent.bullets || rightContent.heading || rightContent.metrics) {
    await addColumnContent(slide, rightContent as ExtendedColumnContent, theme, 5.5, currentY, 4.5, true, imageProcessor, slideContext);
  }
}

async function renderImageFull(
  slide: PptxSlide,
  spec: SlideSpec,
  theme: ProfessionalTheme,
  imageProcessor?: ImageProcessor,
  slideContext?: { title: string; layout: string; index: number; totalSlides: number }
): Promise<void> {
  if (spec.right?.imagePrompt && spec.right?.generateImage) {
    await addImage(slide, spec.right.imagePrompt, theme, 0.5, 1.5, 9.0, 5.0, imageProcessor, slideContext);
  } else if (spec.imagePrompt && spec.generateImage) {
    await addImage(slide, spec.imagePrompt, theme, 0.5, 1.5, 9.0, 5.0, imageProcessor, slideContext);
  }
}

function renderTimeline(slide: PptxSlide, timeline: NonNullable<SlideSpec['timeline']>, theme: ProfessionalTheme, contentY: number): void {
  let currentY = contentY;
  const itemSpacing = 0.8;
  timeline.forEach((item: any) => {
    slide.addText(item.date || '', {
      x: 0.5, y: currentY, w: 1.5, h: 0.4,
      fontSize: Math.min((theme.typography.body.sizes as any).normal, 16),
      bold: true,
      color: safeColorFormat(theme.colors.primary),
      align: 'left'
    } as any);

    slide.addText(item.title || '', {
      x: 2.5, y: currentY, w: 6.5, h: 0.4,
      fontSize: Math.min((theme.typography.headings.sizes as any).h4, 18),
      bold: true,
      color: safeColorFormat(theme.colors.text.primary),
      align: 'left'
    } as any);

    if (item.description) {
      slide.addText(item.description, {
        x: 2.5, y: currentY + 0.4, w: 6.5, h: 0.4,
        fontSize: Math.min((theme.typography.body.sizes as any).small, 13),
        color: safeColorFormat(theme.colors.text.secondary),
        align: 'left'
      } as any);
    }
    currentY += itemSpacing;
  });
}

function renderProcessFlow(slide: PptxSlide, steps: NonNullable<SlideSpec['processSteps']>, theme: ProfessionalTheme, contentY: number): void {
  const stepWidth = 9.0 / steps.length;
  steps.forEach((step, i) => {
    const stepX = 0.5 + i * stepWidth;
    slide.addText(step.step.toString(), {
      x: stepX, y: contentY, w: stepWidth,
      fontSize: Math.min((theme.typography.body.sizes as any).normal, 16),
      color: safeColorFormat(theme.colors.primary),
      align: 'center'
    } as any);
    slide.addText(step.title, {
      x: stepX, y: contentY + 0.5, w: stepWidth,
      fontSize: Math.min((theme.typography.body.sizes as any).small, 12),
      color: safeColorFormat(theme.colors.text.primary),
      align: 'center'
    } as any);
    if (step.description) {
      slide.addText(step.description, {
        x: stepX, y: contentY + 1.0, w: stepWidth,
        fontSize: Math.min((theme.typography.body.sizes as any).tiny, 10),
        color: safeColorFormat(theme.colors.text.secondary),
        align: 'center'
      } as any);
    }
  });
}

async function renderBeforeAfter(slide: PptxSlide, spec: SlideSpec, theme: ProfessionalTheme, contentY: number): Promise<void> {
  if (spec.left) await addColumnContent(slide, spec.left as ExtendedColumnContent, theme, 0.5, contentY, 4.5);
  if (spec.right) await addColumnContent(slide, spec.right as ExtendedColumnContent, theme, 5.5, contentY, 4.5, true);
}

/* ---------- Column + content helpers ---------- */

type ExtendedColumnContent = NonNullable<SlideSpec['left'] | SlideSpec['right']> & { imagePrompt?: string };

async function addColumnContent(
  slide: PptxSlide,
  content: ExtendedColumnContent,
  theme: ProfessionalTheme,
  x: number,
  y: number,
  w: number,
  _isRight: boolean = false,
  imageProcessor?: ImageProcessor,
  slideContext?: { title: string; layout: string; index: number; totalSlides: number }
) {
  let currentY = y;

  if (content.heading) {
    slide.addText(content.heading, {
      x, y: currentY, w, h: 0.5,
      fontSize: Math.min((theme.typography.headings.sizes as any).h3, 20),
      bold: true,
      color: safeColorFormat(theme.colors.primary),
      align: 'left'
    } as any);
    currentY += 0.6;
  }

  if (content.paragraph) {
    addParagraph(slide, content.paragraph, theme, x, currentY, w);
    currentY += 1.5;
  }

  if (content.bullets) {
    addBullets(slide, content.bullets, theme, x, currentY, w);
    currentY += content.bullets.length * 0.5;
  }

  if (content.imagePrompt && content.generateImage) {
    await addImage(slide, content.imagePrompt, theme, x, currentY, w, 3.0, imageProcessor, slideContext);
    currentY += 3.2;
  }

  if (content.metrics && content.metrics.length > 0) {
    content.metrics.forEach((metric, index) => {
      const metricY = currentY + index * 0.8;
      addMetricCard(slide, metric.label, metric.value, metric.unit || '', theme, x, metricY, w, 0.6);
    });
  }
}

/* ---------- Visual primitives ---------- */

async function addColumnBackground(
  slide: PptxSlide,
  theme: ProfessionalTheme,
  x: number,
  y: number,
  width: number
): Promise<void> {
  try {
    slide.addShape('rect', {
      x: x - 0.05,
      y: y - 0.1,
      w: width + 0.1,
      h: 3.5,
      fill: { color: safeColorFormat(theme.colors.surface), transparency: 95 },
      line: { width: 0 },
      rectRadius: 0.1
    } as any);
    console.log('✅ Column background applied');
  } catch (error) {
    console.warn('⚠️ Failed to add column background:', error);
  }
}

function addModernSeparator(slide: PptxSlide, theme: ProfessionalTheme, x: number, y: number, w: number, h: number) {
  const accentColor = theme.colors.accent || theme.colors.primary;
  slide.addText('━'.repeat(Math.max(1, Math.floor(w * 10))), {
    x, y, w, h: h || 0.1,
    fontSize: Math.max(h * 72, 8),
    color: safeColorFormat(accentColor),
    align: 'left',
    fontFace: 'Arial',
    bold: true
  } as any);
}

/* ---------- Text helpers ---------- */

function addEnhancedBullets(slide: PptxSlide, bullets: string[], theme: ProfessionalTheme, x: number, y: number, w: number) {
  const palette = createEnhancedColorPalette(theme);
  const textColorApp = getContextualColor('primary-text', palette, theme.colors.background);
  const accentColorApp = getContextualColor('accent-text', palette, theme.colors.background);
  const fontSize = 18;
  const lineHeight = 0.8;
  const bulletHeight = 0.7;

  const textColor = safeColorFormat(textColorApp.color);
  const accentColor = safeColorFormat(accentColorApp.color);

  bullets.forEach((bullet, i) => {
    const bulletY = y + i * lineHeight;
    if (bulletY + bulletHeight > 5.0) return;

    slide.addText('•', {
      x, y: bulletY, w: 0.4, h: bulletHeight,
      fontSize: fontSize - 2,
      color: accentColor,
      align: 'left',
      valign: 'top',
      bold: true,
      fontFace: 'Calibri'
    } as any);

    slide.addText(bullet, {
      x: x + 0.4, y: bulletY, w: w - 0.4, h: bulletHeight,
      fontSize,
      color: textColor,
      align: 'left',
      valign: 'top'
    } as any);
  });
}
function addBullets(slide: PptxSlide, bullets: string[], theme: ProfessionalTheme, x: number, y: number, w: number) {
  return addEnhancedBullets(slide, bullets, theme, x, y, w);
}

function addEnhancedParagraph(
  slide: PptxSlide,
  text: string,
  theme: ProfessionalTheme,
  x: number,
  y: number,
  w: number,
  isQuote: boolean = false
) {
  const palette = createEnhancedColorPalette(theme);
  const baseFontSize = (theme.typography?.body?.sizes as any)?.normal || 16;
  const fontSize = Math.max(isQuote ? baseFontSize + 2 : baseFontSize, 14);

  const textColorApp = getContextualColor(isQuote ? 'secondary-text' : 'primary-text', palette, theme.colors.background);
  const textColor = safeColorFormat(textColorApp.color);

  const maxHeight = 3.2;
  const availableHeight = 5.2 - y;
  const actualHeight = Math.min(maxHeight, availableHeight);

  if (isQuote) {
    try {
      slide.addShape('rect', {
        x: x - 0.1,
        y: y - 0.1,
        w: w + 0.2,
        h: actualHeight + 0.2,
        fill: { color: safeColorFormat(theme.colors.surface), transparency: 90 },
        line: { width: 0 },
        rectRadius: 0.1
      } as any);
    } catch (error) {
      console.warn('⚠️ Failed to add quote background:', error);
    }
  }

  slide.addText(text, {
    x, y, w, h: actualHeight,
    fontSize,
    color: textColor,
    align: isQuote ? 'center' : 'left',
    valign: 'top',
    italic: isQuote
  } as any);
}
function addParagraph(slide: PptxSlide, text: string, theme: ProfessionalTheme, x: number, y: number, w: number, isQuote: boolean = false) {
  return addEnhancedParagraph(slide, text, theme, x, y, w, isQuote);
}

/* ---------- Image helpers (AI via imageService) ---------- */

async function addEnhancedImage(
  slide: PptxSlide,
  prompt: string,
  _theme: ProfessionalTheme,
  x: number,
  y: number,
  w: number,
  h: number,
  imageProcessor?: ImageProcessor,
  slideContext?: { title: string; layout: string; index: number; totalSlides: number }
) {
  console.log(`🎨 Generating AI-enhanced image: "${prompt.substring(0, 100)}..."`);
  try {
    const { imageService } = await import('./services/imageService');

    let optimizedPrompt = prompt;
    if (imageProcessor) {
      optimizedPrompt = imageProcessor.generateOptimizedPrompt(prompt, slideContext);
      console.log(`   🎯 Optimized prompt: "${optimizedPrompt.substring(0, 100)}..."`);
    }

    const imageResult = await imageService.generateImage(optimizedPrompt, {
      style: 'professional',
      quality: 'high',
      aspectRatio: '16:9',
      enhanceColors: true,
      consistentStyling: true
    });

    console.log(`   ✓ Image generated successfully`);
    if (!imageResult || !imageResult.url) throw new Error('No image URL returned from imageService');

    const imageUrl = imageResult.url;
    console.log(`   ✓ Enhanced image URL: ${imageUrl}`);

    let processedImageBuffer: Buffer;
    let processingStats: any = {};

    if (imageProcessor) {
      console.log(`   🔧 Applying AI image enhancements...`);
      const processingResult = await imageProcessor.processImage(imageUrl, optimizedPrompt, slideContext);
      processedImageBuffer = processingResult.buffer;
      processingStats = processingResult.metadata;
      console.log(`   ✅ Image processing complete`);
    } else {
      // Prefer global fetch (Node 18+) with fallback to axios
      if (typeof (globalThis as any).fetch === 'function') {
        const resp = await fetch(imageUrl as any);
        const ab = await resp.arrayBuffer();
        processedImageBuffer = Buffer.from(ab);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const axios = require('axios');
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        processedImageBuffer = Buffer.from(response.data);
      }
      console.log(`   📥 Downloaded enhanced image: ${Math.round(processedImageBuffer.length / 1024)}KB`);
    }

    let base64: string;
    try {
      base64 = processedImageBuffer.toString('base64');
      if (!base64 || base64.length < 100) throw new Error('Invalid base64 data generated');
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) throw new Error('Malformed base64 data');
    } catch (error) {
      console.error('❌ Failed to convert image to base64:', error);
      throw new Error(`Image encoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      (slide as any).addImage({
        data: `data:image/png;base64,${base64}`,
        x: Math.max(0, x),
        y: Math.max(0, y),
        w: Math.max(0.1, w),
        h: Math.max(0.1, h)
      } as any);
    } catch (error) {
      console.error('❌ Failed to add image to slide:', error);
      throw new Error(`Image addition failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log(`   ✅ AI-enhanced image added at (${x}, ${y}) ${w}x${h}`);
    if (processingStats.processingSteps) {
      console.log(`   📈 Applied enhancements: ${processingStats.processingSteps.join(', ')}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ AI-enhanced image generation failed: ${errorMessage}`);
    (slide as any).addText('Image Generation Failed', {
      x,
      y: y + h / 2 - 0.3,
      w,
      h: 0.6,
      align: 'center',
      color: safeColorFormat('#666666'),
      fontSize: 12
    } as any);
  }
}
async function addImage(
  slide: PptxSlide,
  prompt: string,
  theme: ProfessionalTheme,
  x: number,
  y: number,
  w: number,
  h: number,
  imageProcessor?: ImageProcessor,
  slideContext?: { title: string; layout: string; index: number; totalSlides: number }
) {
  return addEnhancedImage(slide, prompt, theme, x, y, w, h, imageProcessor, slideContext);
}

/* ---------- Chart helpers ---------- */

function addEnhancedChart(
  slide: PptxSlide,
  chart: NonNullable<SlideSpec['chart']>,
  theme: ProfessionalTheme,
  x: number,
  y: number,
  w: number,
  h: number
) {
  console.log('📊 Adding enhanced chart with modern styling');

  try {
    slide.addShape('rect', {
      x: x - 0.1,
      y: y - 0.1,
      w: w + 0.2,
      h: h + 0.2,
      fill: { color: safeColorFormat(theme.colors.surface), transparency: 95 },
      line: { color: safeColorFormat(theme.colors.borders?.light || theme.colors.accent), width: 1 },
      rectRadius: 0.1
    } as any);
  } catch (error) {
    console.warn('⚠️ Failed to add chart background:', error);
  }

  const chartTypeMap: Record<string, any> = {
    bar: 'bar',
    column: 'column',
    line: 'line',
    pie: 'pie',
    doughnut: 'doughnut',
    area: 'area',
    scatter: 'scatter'
  };
  const pptxChartType = chartTypeMap[chart.type] || 'bar';

  const chartData = chart.series.map(s => ({
    name: s.name,
    labels: chart.categories,
    values: s.data
  }));

  const dataPointCount = chart.series.reduce((max, s) => Math.max(max, s.data.length), 0);
  const businessContext = determineBusinessContext(slide, chart);
  const chartStyle = createBusinessContextChartStyle(theme, businessContext, chart.type as any);
  const optimizedStyle = applyDataDrivenOptimizations(chartStyle, dataPointCount);
  const pptOptions = chartStyleToPptOptions(optimizedStyle, chartData);

  (slide as any).addChart(pptxChartType, chartData, {
    x, y, w, h, title: chart.title, ...pptOptions
  } as any);
}

function addChart(
  slide: PptxSlide,
  chart: NonNullable<SlideSpec['chart']>,
  theme: ProfessionalTheme,
  x: number,
  y: number,
  w: number,
  h: number
) {
  return addEnhancedChart(slide, chart, theme, x, y, w, h);
}

/* ---------- Cards / Metrics ---------- */

function addMetricCard(
  slide: PptxSlide,
  label: string,
  value: string,
  unit: string,
  theme: ProfessionalTheme,
  x: number,
  y: number,
  w: number,
  h: number
) {
  try {
    slide.addShape('rect', {
      x, y, w, h,
      fill: { color: safeColorFormat(theme.colors.surface), transparency: 10 },
      line: { color: safeColorFormat(theme.colors.borders.medium), width: 1 },
      rectRadius: 0.15
    } as any);

    slide.addShape('rect', {
      x, y, w, h: 0.05,
      fill: { color: safeColorFormat(theme.colors.accent) },
      line: { width: 0 },
      rectRadius: 0.15
    } as any);

    slide.addText(value, {
      x: x + 0.1, y: y + 0.2, w: w - 0.2, h: h * 0.4,
      fontSize: Math.min((theme.typography.headings.sizes as any).h2, 28),
      color: safeColorFormat(theme.colors.primary),
      align: 'center',
      valign: 'middle',
      bold: true
    } as any);

    if (unit) {
      slide.addText(unit, {
        x: x + 0.1, y: y + h * 0.5, w: w - 0.2, h: h * 0.2,
        fontSize: Math.min((theme.typography.body.sizes as any).small, 12),
        color: safeColorFormat(theme.colors.text.secondary),
        align: 'center',
        valign: 'middle'
      } as any);
    }

    slide.addText(label, {
      x: x + 0.1, y: y + h * 0.7, w: w - 0.2, h: h * 0.25,
      fontSize: Math.min((theme.typography.body.sizes as any).normal, 14),
      color: safeColorFormat(theme.colors.text.primary),
      align: 'center',
      valign: 'middle'
    } as any);
  } catch (error) {
    console.warn('Failed to add metric card, skipping:', error);
  }
}

/* ---------- Page numbers / footer ---------- */

function addPageNumbersAndFooter(
  slide: PptxSlide,
  currentPage: number,
  totalPages: number,
  isTitleSlide: boolean = false
): void {
  const showPageNumbersOnTitleSlide = false;
  if (isTitleSlide && !showPageNumbersOnTitleSlide) return;

  const pageNumberX = SLIDE_DIMENSIONS.WIDTH - 1.0;
  const pageNumberY = SLIDE_DIMENSIONS.HEIGHT - 0.4;
  const pageNumberWidth = 0.8;
  const pageNumberHeight = 0.3;

  slide.addText(`${currentPage} / ${totalPages}`, {
    x: pageNumberX,
    y: pageNumberY,
    w: pageNumberWidth,
    h: pageNumberHeight,
    fontSize: TYPOGRAPHY_CONSTANTS.CAPTION_SIZE,
    color: '666666',
    align: 'right',
    fontFace: 'Arial',
    bold: false
  } as any);

  const includeFooter = false;
  const footerText = 'AI-Generated Presentation';

  if (includeFooter) {
    const footerX = LAYOUT_CONSTANTS.CONTENT_PADDING;
    const footerY = SLIDE_DIMENSIONS.HEIGHT - 0.4;
    const footerWidth = SLIDE_DIMENSIONS.WIDTH - LAYOUT_CONSTANTS.CONTENT_PADDING - 1.5;

    slide.addText(footerText, {
      x: footerX,
      y: footerY,
      w: footerWidth,
      h: pageNumberHeight,
      fontSize: TYPOGRAPHY_CONSTANTS.CAPTION_SIZE,
      color: '666666',
      align: 'left',
      fontFace: 'Arial',
      bold: false
    } as any);
  }
}

/* ---------- Enhanced title ---------- */

async function addEnhancedTitleWithLayout(
  slide: PptxSlide,
  title: string,
  theme: ProfessionalTheme,
  layout: string,
  titlePosition: { x: number; y: number; width: number; height: number; alignment?: string }
): Promise<void> {
  try {
    const isTitleSlide = layout === 'title' || layout === 'hero';
    const palette = createEnhancedColorPalette(theme);

    const typographyTheme = createTypographyTheme(
      theme.category === 'corporate' || theme.category === 'consulting' || theme.category === 'finance' ? 'corporate'
        : theme.category === 'creative' || theme.category === 'vibrant' ? 'creative'
        : theme.category === 'technology' ? 'tech' : 'modern'
    );

    const hierarchy = createTypographyHierarchy(typographyTheme, isTitleSlide ? 'title' : 'content');
    const titleStyle = hierarchy.primary;
    const pptOptions = textStyleToPptOptions(titleStyle) as any;

    slide.addText(title, {
      x: titlePosition.x,
      y: titlePosition.y,
      w: titlePosition.width,
      h: titlePosition.height,
      ...pptOptions,
      align: (titlePosition.alignment as any) || (isTitleSlide ? 'center' : 'left')
    } as any);

    if (!isTitleSlide) {
      const accentColor = getContextualColor('accent-text', palette);
      slide.addShape('rect', {
        x: titlePosition.x,
        y: titlePosition.y + titlePosition.height + 0.1,
        w: Math.min(2.0, titlePosition.width * 0.3),
        h: 0.05,
        fill: { color: safeColorFormat(accentColor.color) },
        line: { width: 0 }
      } as any);
    }
  } catch (error) {
    console.warn('⚠️ Failed to apply enhanced title with layout:', error);
    slide.addText(title, {
      x: titlePosition.x,
      y: titlePosition.y,
      w: titlePosition.width,
      h: titlePosition.height,
      fontSize: layout === 'title' ? 32 : 24,
      color: safeColorFormat(theme.colors.text.primary),
      align: (titlePosition.alignment as any) || (layout === 'title' ? 'center' : 'left')
    } as any);
  }
}

/* ---------- Validation for chart spec + fallback ---------- */

function validateChartData(chart: NonNullable<SlideSpec['chart']>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const supportedTypes = ['bar', 'line', 'pie', 'doughnut', 'area', 'scatter', 'column'];
  if (!supportedTypes.includes(chart.type)) errors.push(`Unsupported chart type: ${chart.type}. Supported: ${supportedTypes.join(', ')}`);
  if (!chart.categories || chart.categories.length === 0) errors.push('Chart must have at least one category');
  if (!chart.series || chart.series.length === 0) {
    errors.push('Chart must have at least one data series');
  } else {
    chart.series.forEach((series, index) => {
      if (!series.name?.trim()) errors.push(`Series ${index + 1} must have a name`);
      if (!series.data || series.data.length === 0) {
        errors.push(`Series ${index + 1} must have data points`);
      } else if (series.data.length !== chart.categories.length) {
        errors.push(`Series ${index + 1} data length (${series.data.length}) must match categories length (${chart.categories.length})`);
      }
      const hasInvalidData = series.data.some(v => typeof v !== 'number' || Number.isNaN(v));
      if (hasInvalidData) errors.push(`Series ${index + 1} contains invalid numeric data`);
    });
  }
  if ((chart.type === 'pie' || chart.type === 'doughnut') && chart.series.length > 1) {
    errors.push(`${chart.type} charts support only one data series`);
  }
  return { valid: errors.length === 0, errors };
}

function renderChartFallback(
  slide: PptxSlide,
  chart: NonNullable<SlideSpec['chart']>,
  theme: ProfessionalTheme,
  errors: string[]
): void {
  const fallbackX = 1.0;
  const fallbackY = LAYOUT_CONSTANTS.CONTENT_Y;
  const fallbackWidth = 8.0;

  if (chart.title) {
    slide.addText(chart.title, {
      x: fallbackX,
      y: fallbackY,
      w: fallbackWidth,
      h: 0.6,
      fontSize: TYPOGRAPHY_CONSTANTS.HEADING_SIZE,
      color: safeColorFormat(theme.colors.text.primary),
      fontFace: (theme.typography.headings as any).fontFamily,
      bold: true,
      align: 'center'
    } as any);
  }

  slide.addText('📊 Chart Data Error', {
    x: fallbackX,
    y: fallbackY + 0.8,
    w: fallbackWidth,
    h: 0.5,
    fontSize: TYPOGRAPHY_CONSTANTS.BODY_SIZE,
    color: safeColorFormat((theme.colors.semantic as any)?.error || '#DC2626'),
    fontFace: (theme.typography.body as any).fontFamily,
    bold: true,
    align: 'center'
  } as any);

  const errorText = errors.join('\n• ');
  slide.addText(`• ${errorText}`, {
    x: fallbackX,
    y: fallbackY + 1.5,
    w: fallbackWidth,
    h: 2.0,
    fontSize: TYPOGRAPHY_CONSTANTS.SMALL_SIZE,
    color: safeColorFormat(theme.colors.text.secondary),
    fontFace: (theme.typography.body as any).fontFamily,
    align: 'left'
  } as any);

  if (chart.series && chart.series.length > 0) {
    let summaryText = '\n\nData Summary:\n';
    chart.series.forEach(series => {
      if (series.name && series.data) {
        const validData = series.data.filter(val => typeof val === 'number' && !Number.isNaN(val));
        summaryText += `${series.name}: ${validData.length} valid data points\n`;
      }
    });

    slide.addText(summaryText, {
      x: fallbackX,
      y: fallbackY + 3.8,
      w: fallbackWidth,
      h: 1.0,
      fontSize: TYPOGRAPHY_CONSTANTS.SMALL_SIZE,
      color: safeColorFormat((theme.colors.text as any).muted || theme.colors.text.secondary),
      fontFace: (theme.typography.body as any).fontFamily,
      align: 'left'
    } as any);
  }
}

/* -------------------------------------------------------
 * Dev samples
 * -----------------------------------------------------*/

export async function generateStyleShowcase(): Promise<Buffer> {
  const sampleSlides: SlideSpec[] = [{ title: 'Sample Title', layout: 'title', design: {} as any }];
  return await generatePpt(sampleSlides, true);
}

export async function generateThemeShowcase(): Promise<Buffer> {
  const themeSlides: SlideSpec[] = [{ title: 'Theme Sample', layout: 'title-paragraph', paragraph: 'Test', design: {} as any }];
  return await generatePpt(themeSlides, true);
}