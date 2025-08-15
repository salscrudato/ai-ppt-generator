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
 * - AI-generated image integration via DALL-E 3 with error handling
 * - Professional theme system with brand customization
 * - Dynamic positioning and responsive sizing
 * - Enhanced typography and visual hierarchy
 * - Robust error handling and fallback mechanisms
 *
 * @version 3.4.2-enhanced-fixed
 * @author AI PowerPoint Generator Team (enhanced by expert co-pilot)
 */

import pptxgen from 'pptxgenjs';
import type { SlideSpec } from './schema';
import { getThemeById, selectThemeForContent, customizeTheme, type ProfessionalTheme } from './professionalThemes';
import { ModernTheme, getModernTheme, MODERN_THEMES } from './core/theme/modernThemes';
import { UNIFIED_LAYOUT_CONSTANTS, LAYOUT_POSITIONS, LAYOUT_CONSTANTS, SLIDE_DIMENSIONS, TYPOGRAPHY_CONSTANTS } from './constants/layoutConstants';
import {
  createModernHeroSlide,
  createModernContentSlide,
  createModernMetricsSlide,
  createAdvancedHeroSlide,
  createFeatureShowcaseSlide,
  createTestimonialSlide,
  createDataVisualizationSlide
} from './slides/modernSlideGenerators';
import { VISUAL_EFFECT_PRESETS, createModernCardBackground, createAccentElement, applyVisualEffects } from './core/theme/visualEffects';
import { getTypographyPairing, createModernTextOptions, TEXT_STYLE_PRESETS } from './core/theme/modernTypography';
import {
  defineSlideMasters,
  addSlideWithMaster,
  SLIDE_MASTER_NAMES,
  getMasterForLayout,
  type SlideMasterConfig
} from './core/slideMasters';
import {
  ImageProcessor,
  createImageProcessorConfig,
  type ImageProcessingConfig
} from './core/imageProcessor';
import {
  generateContextualNotes,
  generatePresentationSummary,
  type SpeakerNotesConfig
} from './core/speakerNotes';
import {
  generatePresentationMetadata,
  applyMetadataToPresentation,
  generateFileName,
  type MetadataConfig
} from './core/documentMetadata';
import {
  addNativeChart,
  extractDataFromSlide,
  generateSampleData,
  type ChartConfig
} from './core/chartGeneration';
import {
  addNativeTable,
  extractTableDataFromSlide,
  type TableConfig
} from './core/tableGeneration';
import { validateSlideStyle, type StyleValidationResult } from './styleValidator';
import OpenAI from 'openai';
import { defineSecret } from 'firebase-functions/params';
import { getImageModelConfig } from './config/aiModels';

const openaiApiKey = defineSecret('OPENAI_API_KEY');

let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    const apiKey = openaiApiKey.value();
    if (!apiKey) throw new Error('OpenAI API key not configured');
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

/**
 * Safe color formatting - removes # and validates hex format
 */
function safeColorFormat(color: string): string {
  if (!color) return '000000';

  // Remove # if present
  const cleanColor = color.replace('#', '');

  // Validate hex format (6 characters)
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanColor)) {
    console.warn(`Invalid color format: ${color}, using default`);
    return '000000';
  }

  return cleanColor;
}

/**
 * Sanitize slide specification to prevent PowerPoint corruption
 */
function sanitizeSlideSpec(spec: SlideSpec): SlideSpec {
  const sanitized: SlideSpec = {
    ...spec,
    // Sanitize title - remove problematic characters and limit length
    title: sanitizeText(spec.title || 'Untitled Slide', 100),

    // Sanitize paragraph content
    paragraph: spec.paragraph ? sanitizeText(spec.paragraph, 2000) : undefined,

    // Sanitize bullets
    bullets: spec.bullets?.map(bullet => sanitizeText(bullet, 500)).filter(Boolean),

    // Sanitize speaker notes (correct property name is 'notes')
    notes: spec.notes ? sanitizeText(spec.notes, 3000) : undefined,

    // Sanitize image prompt
    imagePrompt: spec.imagePrompt ? sanitizeText(spec.imagePrompt, 1000) : undefined
  };

  // Sanitize nested content for two-column layouts
  if (spec.left) {
    sanitized.left = {
      ...spec.left,
      heading: spec.left.heading ? sanitizeText(spec.left.heading, 80) : undefined,
      paragraph: spec.left.paragraph ? sanitizeText(spec.left.paragraph, 1000) : undefined,
      bullets: spec.left.bullets?.map(bullet => sanitizeText(bullet, 500)).filter(Boolean),
      imagePrompt: spec.left.imagePrompt ? sanitizeText(spec.left.imagePrompt, 1000) : undefined
    };
  }

  if (spec.right) {
    sanitized.right = {
      ...spec.right,
      heading: spec.right.heading ? sanitizeText(spec.right.heading, 80) : undefined,
      paragraph: spec.right.paragraph ? sanitizeText(spec.right.paragraph, 1000) : undefined,
      bullets: spec.right.bullets?.map(bullet => sanitizeText(bullet, 500)).filter(Boolean),
      imagePrompt: spec.right.imagePrompt ? sanitizeText(spec.right.imagePrompt, 1000) : undefined
    };
  }

  return sanitized;
}

/**
 * Sanitize text content to prevent PowerPoint corruption
 */
function sanitizeText(text: string, maxLength: number = 1000): string {
  if (!text) return '';

  // Remove or replace problematic characters that can cause PowerPoint corruption
  let sanitized = text
    // Remove null bytes and other control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Replace problematic Unicode characters
    .replace(/[\uFEFF\uFFFE\uFFFF]/g, '')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    .trim();

  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength - 3) + '...';
  }

  return sanitized;
}

/**
 * Extract presentation metadata from slide specifications
 */
function extractPresentationMetadata(specs: SlideSpec[]): {
  title: string;
  description: string;
  keywords: string[];
  estimatedDuration: number;
  slideTypes: string[];
} {
  const title = specs.length > 0 ? specs[0].title : 'Professional Presentation';

  // Extract keywords from all slide content
  const allText = specs.map(spec =>
    [spec.title, spec.paragraph, ...(spec.bullets || [])].filter(Boolean).join(' ')
  ).join(' ');

  // Simple keyword extraction (could be enhanced with NLP)
  const words = allText.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const wordFreq = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const keywords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);

  // Estimate presentation duration (roughly 1-2 minutes per slide)
  const estimatedDuration = specs.length * 1.5;

  // Collect slide types
  const slideTypes = [...new Set(specs.map(spec => spec.layout))];

  const description = `Professional presentation with ${specs.length} slides covering ${slideTypes.join(', ')} layouts.`;

  return {
    title,
    description,
    keywords,
    estimatedDuration,
    slideTypes
  };
}

/**
 * Add consistent visual branding elements to slides
 */
function addVisualBrandingElements(
  slide: pptxgen.Slide,
  theme: ProfessionalTheme | ModernTheme,
  slideIndex: number,
  totalSlides: number,
  options: {
    includeProgressBar?: boolean;
    includeBrandAccent?: boolean;
    slideType?: string;
  } = {}
): void {
  const isModern = 'palette' in theme;
  const accentColor = isModern
    ? (theme as ModernTheme).palette.accent
    : (theme as ProfessionalTheme).colors.accent;

  const primaryColor = isModern
    ? (theme as ModernTheme).palette.primary
    : (theme as ProfessionalTheme).colors.primary;

  // Add progress bar at the top (optional)
  if (options.includeProgressBar && slideIndex > 0) {
    const progressWidth = (slideIndex / totalSlides) * 10.0;

    // Background progress bar
    slide.addShape('rect', {
      x: 0, y: 0, w: 10.0, h: 0.05,
      fill: {
        color: safeColorFormat(accentColor),
        transparency: 90
      },
      line: { width: 0 }
    });

    // Active progress bar
    slide.addShape('rect', {
      x: 0, y: 0, w: progressWidth, h: 0.05,
      fill: {
        color: safeColorFormat(accentColor),
        transparency: 20
      },
      line: { width: 0 }
    });
  }

  // Add subtle brand accent in corner (optional)
  if (options.includeBrandAccent && options.slideType !== 'title') {
    slide.addShape('ellipse', {
      x: 9.5, y: 0.1, w: 0.4, h: 0.4,
      fill: {
        color: safeColorFormat(primaryColor),
        transparency: 80
      },
      line: { width: 0 }
    });
  }
}

/**
 * Determine if modern theme should be used based on design preferences
 */
function shouldUseModernTheme(spec: SlideSpec): boolean {
  // Check for modern theme indicators in design object
  if (spec.design?.modern === true) return true;
  if (spec.design?.theme && MODERN_THEMES.some(t => t.id === spec.design?.theme)) return true;
  if (spec.design?.style === 'modern') return true;

  // Check for modern layout types
  const modernLayouts = ['hero', 'metrics-dashboard', 'feature-showcase', 'testimonial-card'];
  if (modernLayouts.includes(spec.layout)) return true;

  return false;
}

/**
 * Type guard to check if theme is modern
 */
function isModernTheme(theme: ProfessionalTheme | ModernTheme): theme is ModernTheme {
  return 'gradients' in theme;
}

/**
 * Get appropriate theme (modern or traditional) based on specifications
 */
function getAppropriateTheme(spec: SlideSpec): ProfessionalTheme | ModernTheme {
  if (shouldUseModernTheme(spec)) {
    const modernThemeId = spec.design?.theme;
    if (modernThemeId) {
      const modernTheme = getModernTheme(modernThemeId);
      if (modernTheme) return modernTheme;
    }
    // Default to first modern theme
    return MODERN_THEMES[0];
  }

  // Use traditional theme system
  let theme = getThemeById(spec.design?.theme || '') ||
              selectThemeForContent({
                presentationType: spec.layout,
                tone: 'professional'
              });

  // Ensure we have a theme (fallback to default if needed)
  if (!theme) {
    theme = selectThemeForContent({
      presentationType: 'business',
      tone: 'professional'
    });
  }

  // Apply custom brand colors if provided
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

/**
 * Determine presentation type from slide specifications
 */
function determinePresentationType(specs: SlideSpec[]): 'business' | 'creative' | 'academic' | 'technical' {
  // Analyze slide content to determine presentation type
  const keywords = specs.flatMap(spec => [
    spec.title?.toLowerCase() || '',
    spec.bullets?.join(' ').toLowerCase() || '',
    spec.paragraph?.toLowerCase() || ''
  ]).join(' ');

  if (keywords.includes('research') || keywords.includes('study') || keywords.includes('analysis')) {
    return 'academic';
  }
  if (keywords.includes('technical') || keywords.includes('development') || keywords.includes('engineering')) {
    return 'technical';
  }
  if (keywords.includes('creative') || keywords.includes('design') || keywords.includes('art')) {
    return 'creative';
  }

  return 'business'; // Default
}

/**
 * Generate a PowerPoint file buffer from slide specifications
 * Enhanced with style validation and quality assurance
 *
 * @param specs - Array of slide specifications
 * @param validateStyles - Whether to perform style validation (default: true)
 * @returns Promise<Buffer> - PowerPoint file buffer
 */
export async function generatePpt(specs: SlideSpec[], validateStyles: boolean = true): Promise<Buffer> {
  console.log('🎯 generatePpt called with specs:', {
    specsCount: specs.length,
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

  // Validate and sanitize input specs to prevent corruption
  const sanitizedSpecs = specs.map(spec => sanitizeSlideSpec(spec));
  console.log(`🧹 Sanitized ${sanitizedSpecs.length} slide specifications`);

  // Validate that we have at least one slide
  if (sanitizedSpecs.length === 0) {
    throw new Error('No valid slide specifications provided');
  }

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';

  // Use unified layout constants for exact preview alignment

  // Generate comprehensive presentation metadata
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

  // Get theme for slide masters (use first slide's theme or default)
  const masterTheme: ProfessionalTheme | ModernTheme = sanitizedSpecs.length > 0
    ? getAppropriateTheme(sanitizedSpecs[0])
    : getModernTheme('minimal') || selectThemeForContent({ presentationType: 'business', tone: 'professional' });

  const presentationMetadata = generatePresentationMetadata(sanitizedSpecs, masterTheme, metadataConfig);

  // Initialize advanced image processor
  const presentationType = determinePresentationType(sanitizedSpecs);
  const imageProcessorConfig = createImageProcessorConfig(presentationType, 'balanced');
  const imageProcessor = new ImageProcessor(imageProcessorConfig);

  console.log(`🖼️ Initialized image processor for ${presentationType} presentation`);

  // Apply comprehensive metadata to presentation
  applyMetadataToPresentation(pres, presentationMetadata);

  // Set presentation properties for professional appearance
  pres.rtlMode = false; // Left-to-right reading



  // TEMPORARILY DISABLE SLIDE MASTERS TO PREVENT CORRUPTION
  // TODO: Re-enable after fixing corruption issues
  console.log('⚠️ Slide masters temporarily disabled to prevent corruption');

  // // Define slide masters for consistent design with enhanced visual elements
  // defineSlideMasters(pres, {
  //   theme: masterTheme,
  //   includeSlideNumbers: true,
  //   includeFooter: true,
  //   footerText: 'AI-Generated Professional Presentation',
  //   companyName: 'Professional Presentations',
  //   includeWatermark: false, // Can be enabled for branded presentations
  //   watermarkText: 'CONFIDENTIAL',
  //   includeAccentElements: true,
  //   brandColor: 'palette' in masterTheme
  //     ? (masterTheme as ModernTheme).palette.accent
  //     : (masterTheme as ProfessionalTheme).colors.accent
  // });

  // Note: Slide numbering is handled through slide masters

  // Style validation results for quality assurance
  const validationResults: StyleValidationResult[] = [];

  for (let i = 0; i < sanitizedSpecs.length; i++) {
    const spec = sanitizedSpecs[i];

    // Enhanced theme selection with modern theme support
    const theme = getAppropriateTheme(spec);
    const useModernTheme = isModernTheme(theme);

    // Validate slide style quality if enabled (only for traditional themes)
    if (validateStyles && !useModernTheme) {
      const styleValidation = validateSlideStyle(spec, theme as ProfessionalTheme);
      validationResults.push(styleValidation);

      // Log style issues for debugging
      if (styleValidation.issues.length > 0) {
        console.log(`Style validation for slide "${spec.title}":`, {
          score: styleValidation.score,
          grade: styleValidation.grade,
          issues: styleValidation.issues.map(i => i.message)
        });
      }
    }

    // TEMPORARILY USE REGULAR SLIDES INSTEAD OF MASTERS
    // const masterName = getMasterForLayout(spec.layout);
    // const slide = addSlideWithMaster(pres, masterName);
    const slide = pres.addSlide();

    // Use modern slide generation for modern themes
    if (useModernTheme && isModernTheme(theme)) {
      const modernTheme = theme;

      // Handle modern slide layouts
      if (spec.layout === 'title' || spec.layout === 'hero') {
        createModernHeroSlide(slide, {
          title: spec.title,
          subtitle: spec.paragraph,
          author: spec.design?.author,
          date: spec.design?.date,
          backgroundStyle: spec.design?.backgroundStyle as any || 'minimal'
        }, modernTheme);

        // Skip traditional rendering for modern hero slides
        continue;
      } else if (spec.layout === 'gradient-hero') {
        createAdvancedHeroSlide(slide, {
          title: spec.title,
          subtitle: spec.paragraph,
          callToAction: 'Learn More',
          backgroundStyle: 'gradient'
        }, modernTheme);

        continue;
      } else if (spec.layout === 'feature-showcase') {
        // Convert bullets to features format
        const features = spec.bullets?.map((bullet, index) => ({
          icon: '⭐', // Default icon
          title: `Feature ${index + 1}`,
          description: bullet,
          color: modernTheme.palette.accent
        })) || [];

        createFeatureShowcaseSlide(slide, {
          title: spec.title,
          features,
          layout: 'grid'
        }, modernTheme);

        continue;
      } else if (spec.layout === 'testimonial-card') {
        createTestimonialSlide(slide, {
          title: spec.title,
          quote: spec.paragraph || 'This is an amazing product that has transformed our business.',
          author: spec.design?.author || 'John Doe',
          role: 'CEO',
          company: 'Example Corp'
        }, modernTheme);

        continue;
      } else if (spec.layout === 'metrics-dashboard' && spec.bullets) {
        // Convert bullets to metrics format for modern metrics slide
        const metrics = spec.bullets.map((bullet, index) => ({
          value: `${index + 1}`,
          label: bullet,
          trend: 'neutral' as const
        }));

        createModernMetricsSlide(slide, {
          title: spec.title,
          metrics,
          layout: 'grid'
        }, modernTheme);

        continue;
      } else if (spec.bullets || spec.paragraph) {
        // Modern content slide
        const content = spec.bullets || (spec.paragraph ? [spec.paragraph] : []);
        createModernContentSlide(slide, {
          title: spec.title,
          content,
          layout: spec.design?.contentLayout as any || 'bullets',
          accentColor: modernTheme.palette.accent
        }, modernTheme);

        continue;
      }
    }

    // Traditional slide rendering for non-modern themes
    const traditionalTheme = theme as ProfessionalTheme;

    // TEMPORARILY DISABLE VISUAL BRANDING TO PREVENT CORRUPTION
    // addVisualBrandingElements(slide, traditionalTheme, i, sanitizedSpecs.length, {
    //   includeProgressBar: sanitizedSpecs.length > 3, // Only for longer presentations
    //   includeBrandAccent: true,
    //   slideType: spec.layout
    // });

    // TEMPORARILY USE REGULAR SLIDE RENDERING INSTEAD OF MASTERS
    // Set slide background
    const bgColor = safeColorFormat(traditionalTheme.colors.background);
    if (bgColor !== 'FFFFFF') { // Only set if not default white
      slide.background = { color: bgColor };
    }

    // Add slide title
    slide.addText(spec.title || 'Untitled Slide', {
      x: 0.75, y: 0.4, w: 8.5, h: 0.8,
      fontSize: spec.layout === 'title' ? 36 : 28,
      bold: true,
      color: safeColorFormat(traditionalTheme.colors.primary),
      align: spec.layout === 'title' ? 'center' : 'left',
      fontFace: traditionalTheme.typography.headings.fontFamily
    });

    // Enhanced dynamic layout handling with comprehensive support
    const slideContext = { title: spec.title, layout: spec.layout, index: i, totalSlides: sanitizedSpecs.length };
    await renderSlideLayout(slide, spec, traditionalTheme, imageProcessor, slideContext);
    // All slide master logic has been replaced with regular slide rendering above

    // Generate comprehensive speaker notes
    const speakerNotesConfig: SpeakerNotesConfig = {
      includeTransitions: true,
      includeTimingGuidance: true,
      includeEngagementTips: specs.length > 5, // Only for longer presentations
      includeAccessibilityNotes: true,
      verbosityLevel: 'detailed',
      audienceLevel: 'general'
    };

    let notesText = '';

    // Use existing notes if provided, otherwise generate comprehensive notes
    if (spec.notes && spec.notes.trim()) {
      notesText = spec.notes;
      // Enhance existing notes with contextual information
      notesText += '\n\n' + generateContextualNotes(specs, i, {
        ...speakerNotesConfig,
        verbosityLevel: 'concise' // Less verbose when user provided notes
      });
    } else {
      // Generate full contextual notes
      notesText = generateContextualNotes(specs, i, speakerNotesConfig);
    }

    // Add sources to notes if provided
    if (spec.sources && spec.sources.length > 0) {
      notesText += '\n\n📚 SOURCES & REFERENCES:\n';
      spec.sources.forEach((source, index) => {
        // Check if source is a URL or text reference
        if (source.startsWith('http://') || source.startsWith('https://')) {
          notesText += `${index + 1}. ${source}\n`;
        } else {
          notesText += `${index + 1}. ${source}\n`;
        }
      });
      notesText += '\n💡 TIP: Reference these sources during your presentation to build credibility and provide additional context for audience questions.';
    }

    // Add presentation summary to first slide notes
    if (i === 0) {
      const presentationSummary = generatePresentationSummary(specs);
      notesText = presentationSummary + '\n\n' + notesText;
    }

    slide.addNotes(notesText);

    // Add page numbers and footer (B-3: Page Numbers & Footer)
    addPageNumbersAndFooter(slide, i + 1, sanitizedSpecs.length, spec.layout === 'title');
  }

  // Write the presentation to buffer with error handling
  try {
    console.log('🔄 Generating PowerPoint buffer...');

    // Use explicit options for better compatibility
    const buffer = await pres.write({
      outputType: 'nodebuffer',
      compression: true // Enable compression for smaller file size
    });

    console.log(`✅ PowerPoint buffer generated successfully: ${Math.round((buffer as Buffer).length / 1024)}KB`);
    return buffer as Buffer;
  } catch (error) {
    console.error('❌ Failed to generate PowerPoint buffer:', error);
    throw new Error(`PowerPoint generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Slide layout renderer for slide masters - populates placeholders
 * Enhanced with improved spacing, professional positioning, and modern visual elements
 */
async function renderSlideLayoutWithMaster(
  slide: pptxgen.Slide,
  spec: SlideSpec,
  theme: ProfessionalTheme,
  contentPadding: number,
  maxContentWidth: number,
  imageProcessor?: ImageProcessor,
  slideContext?: { title: string; layout: string; index: number; totalSlides: number }
): Promise<void> {
  console.log('🎯 renderSlideLayoutWithMaster called with:', {
    title: spec.title,
    layout: spec.layout,
    hasBullets: !!spec.bullets,
    bulletsCount: spec.bullets?.length,
    hasRightImage: !!spec.right?.imagePrompt,
    hasLeftImage: !!spec.left?.imagePrompt
  });

  // Check for automatic chart generation opportunities
  const extractedData = extractDataFromSlide(spec);
  const extractedTableData = extractTableDataFromSlide(spec);

  // Temporarily disable automatic chart generation to prevent corruption
  // TODO: Fix chart data validation and format issues
  if (false && extractedData.hasNumericData && extractedData.confidence > 60) {
    console.log('🔍 Auto-generating chart from extracted data:', {
      confidence: extractedData.confidence,
      type: extractedData.suggestedChartType,
      datasets: extractedData.datasets.length
    });

    // Generate chart automatically if we have good data
    const chartConfig: ChartConfig = {
      type: extractedData.suggestedChartType,
      title: `${spec.title} - Data Visualization`,
      data: extractedData.datasets,
      position: { x: 0.75, y: 2.0, w: 8.5, h: 2.5 },
      theme,
      showLegend: true,
      showDataLabels: false,
      showTitle: true
    };

    addNativeChart(slide, chartConfig);

    // Add remaining content below chart if any
    let remainingContent = '';
    if (spec.bullets && spec.bullets!.length > 0) {
      const nonNumericBullets = spec.bullets!.filter(bullet =>
        !bullet.match(/\d+(?:\.\d+)?/g) || bullet.length > 50
      );
      if (nonNumericBullets.length > 0) {
        remainingContent = nonNumericBullets.map(bullet => `• ${bullet}`).join('\n');
      }
    } else if (spec.paragraph) {
      remainingContent = spec.paragraph!;
    }

    if (remainingContent) {
      slide.addText(remainingContent, {
        x: 0.75, y: 4.7, w: 8.5, h: 0.8,
        fontSize: 14,
        fontFace: 'Arial'
      });
    }
  } else if (false && extractedTableData.hasTableData && extractedTableData.confidence > 70) {
    // Temporarily disable automatic table generation to prevent corruption
    console.log('🔍 Auto-generating table from extracted data:', {
      confidence: extractedTableData.confidence,
      headers: extractedTableData.headers.length,
      rows: extractedTableData.rows.length
    });

    // Generate table automatically if we have good structured data
    const tableConfig: TableConfig = {
      headers: extractedTableData.headers,
      rows: extractedTableData.rows,
      position: { x: 0.75, y: 2.0, w: 8.5, h: 3.0 },
      theme,
      title: extractedTableData.suggestedTitle,
      showHeaders: true,
      alternateRowColors: true,
      borderStyle: 'light',
      headerStyle: 'primary'
    };

    addNativeTable(slide, tableConfig);
  } else {
    // Enhanced content rendering for slide masters with layout support
    if (spec.layout === 'mixed-content') {
      // Handle mixed-content layout with left/right sections
      console.log('🔄 Processing mixed-content layout in master renderer');
      console.log('📊 Spec details:', {
        hasLeft: !!spec.left,
        hasRight: !!spec.right,
        leftBullets: spec.left?.bullets?.length || 0,
        rightBullets: spec.right?.bullets?.length || 0,
        leftParagraph: !!spec.left?.paragraph,
        rightParagraph: !!spec.right?.paragraph,
        rootParagraph: !!spec.paragraph,
        rootBullets: spec.bullets?.length || 0
      });

      // Handle case where content is in left/right sections
      if (spec.left || spec.right) {
        // Left section content
        if (spec.left) {
          let leftContent = '';
          if (spec.left.bullets) {
            leftContent = spec.left.bullets.map(bullet => `• ${bullet}`).join('\n');
            console.log('📝 Left bullets content:', leftContent);
          } else if (spec.left.paragraph) {
            leftContent = spec.left.paragraph;
            console.log('📝 Left paragraph content:', leftContent);
          }

          if (leftContent) {
            slide.addText(leftContent, {
              x: 0.5, y: 1.6, w: 4.5, h: 4.0,
              fontSize: 14,
              fontFace: 'Arial',
              color: safeColorFormat((theme.colors.text as any)?.primary || '#000000'),
              valign: 'top'
            });
          }
        }

        // Right section content
        if (spec.right) {
          let rightContent = '';
          if (spec.right.bullets) {
            rightContent = spec.right.bullets.map(bullet => `• ${bullet}`).join('\n');
            console.log('📝 Right bullets content:', rightContent);
          } else if (spec.right.paragraph) {
            rightContent = spec.right.paragraph;
            console.log('📝 Right paragraph content:', rightContent);
          }

          if (rightContent) {
            slide.addText(rightContent, {
              x: 5.5, y: 1.6, w: 4.0, h: 4.0,
              fontSize: 14,
              fontFace: 'Arial',
              color: safeColorFormat((theme.colors.text as any)?.primary || '#000000'),
              valign: 'top'
            });
          }
        }
      } else {
        // Handle case where content is at root level - split it into two columns
        console.log('🔄 Root-level content detected, splitting into columns');

        let leftContent = '';
        let rightContent = '';

        // Put paragraph on left, bullets on right
        if (spec.paragraph) {
          leftContent = spec.paragraph;
          console.log('📝 Left paragraph content (from root):', leftContent);
        }

        if (spec.bullets) {
          rightContent = spec.bullets.map(bullet => `• ${bullet}`).join('\n');
          console.log('📝 Right bullets content (from root):', rightContent);
        }

        // Add left content (paragraph)
        if (leftContent) {
          slide.addText(leftContent, {
            x: 0.5, y: 1.6, w: 4.5, h: 4.0,
            fontSize: 14,
            fontFace: 'Arial',
            color: safeColorFormat((theme.colors.text as any)?.primary || '#000000'),
            valign: 'top'
          });
        }

        // Add right content (bullets)
        if (rightContent) {
          slide.addText(rightContent, {
            x: 5.5, y: 1.6, w: 4.0, h: 4.0,
            fontSize: 14,
            fontFace: 'Arial',
            color: safeColorFormat((theme.colors.text as any)?.primary || '#000000'),
            valign: 'top'
          });
        }
      }
    } else {
      // Standard content rendering for other layouts
      let bodyContent = '';

      if (spec.bullets) {
        bodyContent = spec.bullets.map(bullet => `• ${bullet}`).join('\n');
      } else if (spec.paragraph) {
        bodyContent = spec.paragraph;
      }

      if (bodyContent) {
        slide.addText(bodyContent, { placeholder: 'body' });
      }
    }
  }
}

/**
 * Comprehensive slide layout renderer supporting all layout types
 * Enhanced with improved spacing, professional positioning, and modern visual elements
 */
async function renderSlideLayout(
  slide: pptxgen.Slide,
  spec: SlideSpec,
  theme: ProfessionalTheme,
  imageProcessor?: ImageProcessor,
  slideContext?: { title: string; layout: string; index: number; totalSlides: number }
): Promise<void> {
  console.log('🎯 renderSlideLayout called with:', {
    title: spec.title,
    layout: spec.layout,
    hasBullets: !!spec.bullets,
    bulletsCount: spec.bullets?.length,
    hasRightImage: !!spec.right?.imagePrompt,
    hasLeftImage: !!spec.left?.imagePrompt
  });

  // Use unified layout constants for exact preview alignment
  const { CONTENT_Y, COLUMN_WIDTH, COLUMN_GAP } = LAYOUT_CONSTANTS;

  switch (spec.layout) {
    case 'title':
      // Title already rendered by caller; keep slide clean
      break;

    case 'title-bullets':
      if (spec.bullets) addBullets(slide, spec.bullets, theme, LAYOUT_CONSTANTS.CONTENT_PADDING, CONTENT_Y, LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH);
      break;

    case 'title-paragraph':
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, LAYOUT_CONSTANTS.CONTENT_PADDING, CONTENT_Y, LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH);
      break;

    case 'two-column':
      if (spec.left) await addColumnContent(slide, spec.left as ExtendedColumnContent, theme, LAYOUT_CONSTANTS.CONTENT_PADDING, CONTENT_Y, COLUMN_WIDTH, false, imageProcessor, slideContext);
      if (spec.right) await addColumnContent(slide, spec.right as ExtendedColumnContent, theme, LAYOUT_CONSTANTS.CONTENT_PADDING + COLUMN_WIDTH + COLUMN_GAP, CONTENT_Y, COLUMN_WIDTH, true, imageProcessor, slideContext);
      break;

    case 'mixed-content':
      await renderMixedContent(slide, spec, theme, CONTENT_Y, imageProcessor, slideContext);
      break;

    case 'image-right':
      await renderImageRight(slide, spec, theme, CONTENT_Y, imageProcessor, slideContext);
      break;

    case 'image-left':
      await renderImageLeft(slide, spec, theme, CONTENT_Y, imageProcessor, slideContext);
      break;

    case 'image-full':
      await renderImageFull(slide, spec, theme, imageProcessor, slideContext);
      break;

    case 'quote':
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, 1.0, CONTENT_Y, 8.0, true);
      break;

    case 'chart':
      if (spec.chart) {
        try {
          // Validate chart data before rendering
          const isValidChart = validateChartData(spec.chart);

          if (isValidChart.valid) {
            // Use new native chart system with enhanced error handling
            const chartConfig: ChartConfig = {
              type: spec.chart.type as ChartConfig['type'],
              title: spec.chart.title,
              data: spec.chart.series.map(series => ({
                name: series.name,
                labels: spec.chart!.categories,
                values: series.data,
                color: series.color
              })),
              position: { x: 1.0, y: CONTENT_Y, w: 8.0, h: 4.0 },
              theme,
              showLegend: spec.chart.showLegend,
              showDataLabels: spec.chart.showDataLabels,
              showTitle: true
            };
            addNativeChart(slide, chartConfig);
          } else {
            // Graceful fallback: render chart description as text
            console.warn('Invalid chart data, falling back to text description:', isValidChart.errors);
            renderChartFallback(slide, spec.chart, theme, isValidChart.errors);
          }
        } catch (error) {
          console.error('Chart rendering failed, using fallback:', error);
          renderChartFallback(slide, spec.chart, theme, [`Chart rendering error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
        }
      }
      break;

    case 'comparison-table':
      if (spec.comparisonTable) {
        // Use new native table system
        const tableConfig: TableConfig = {
          headers: spec.comparisonTable.headers,
          rows: spec.comparisonTable.rows,
          position: { x: 1.0, y: CONTENT_Y, w: 8.0, h: 3.5 },
          theme,
          title: `${spec.title} - Comparison`,
          showHeaders: true,
          alternateRowColors: true,
          borderStyle: 'medium',
          headerStyle: 'primary'
        };
        addNativeTable(slide, tableConfig);
      }
      break;

    case 'timeline':
      if (spec.timeline) renderTimeline(slide, spec.timeline, theme, CONTENT_Y);
      break;

    case 'process-flow':
      if (spec.processSteps) renderProcessFlow(slide, spec.processSteps, theme, CONTENT_Y);
      break;

    case 'before-after':
    case 'problem-solution':
      // Both are two-column semantics
      await renderBeforeAfter(slide, spec, theme, CONTENT_Y);
      break;

    case 'data-visualization':
      if (spec.chart) addChart(slide, spec.chart, theme, 1.0, CONTENT_Y, 8.0, 4.0);
      break;

    case 'testimonial':
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, 1.0, CONTENT_Y, 8.0, true);
      break;

    case 'team-intro':
    case 'contact-info':
      if (spec.bullets) addBullets(slide, spec.bullets, theme, 1.0, CONTENT_Y, 8.0);
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, 1.0, CONTENT_Y + 0.8, 8.0);
      break;

    case 'agenda':
      // Polished agenda layout with consistent spacing and separators
      slide.addText('Agenda', {
        x: LAYOUT_CONSTANTS.CONTENT_PADDING,
        y: CONTENT_Y,
        w: LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH,
        h: 0.5,
        fontFace: theme.typography.headings.fontFamily,
        fontSize: theme.typography.headings.sizes.h2,
        bold: true,
        color: safeColorFormat(theme.colors.text.primary)
      });
      addModernSeparator(slide, theme, LAYOUT_CONSTANTS.CONTENT_PADDING, CONTENT_Y + 0.6, LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH, 0.04);
      if (spec.bullets) addEnhancedBullets(slide, spec.bullets, theme, LAYOUT_CONSTANTS.CONTENT_PADDING, CONTENT_Y + 0.9, LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH);
      break;

    case 'section-divider':
      // SIMPLIFIED SECTION DIVIDER - NO SHAPES TO PREVENT CORRUPTION
      slide.addText(spec.title || 'Section', {
        x: LAYOUT_CONSTANTS.CONTENT_PADDING,
        y: CONTENT_Y + 1.0,
        w: LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH,
        h: 1.0,
        fontSize: Math.min(theme.typography.headings.sizes.h1, 40),
        bold: true,
        color: safeColorFormat(theme.colors.primary),
        align: 'center'
      });
      break;

    case 'thank-you':
      slide.addText('Thank You', {
        x: 0,
        y: CONTENT_Y + 1.0,
        w: 10,
        h: 1.0,
        align: 'center',
        fontFace: theme.typography.headings.fontFamily,
        fontSize: theme.typography.headings.sizes.h1,
        bold: true,
        color: safeColorFormat(theme.colors.primary)
      });
      if (spec.paragraph) {
        slide.addText(spec.paragraph, {
          x: 2.0, y: CONTENT_Y + 2.2, w: 6.0, h: 1.5,
          align: 'center',
          fontFace: theme.typography.body.fontFamily,
          fontSize: theme.typography.body.sizes.normal,
          color: safeColorFormat(theme.colors.text.secondary)
        });
      }
      break;

    default:
      if (spec.bullets) addBullets(slide, spec.bullets, theme, LAYOUT_CONSTANTS.CONTENT_PADDING, CONTENT_Y, LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH);
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, LAYOUT_CONSTANTS.CONTENT_PADDING, CONTENT_Y, LAYOUT_CONSTANTS.MAX_CONTENT_WIDTH);
      break;
  }
}

/**
 * Render mixed content layout
 */
async function renderMixedContent(
  slide: pptxgen.Slide,
  spec: SlideSpec,
  theme: ProfessionalTheme,
  contentY: number,
  imageProcessor?: ImageProcessor,
  slideContext?: { title: string; layout: string; index: number; totalSlides: number }
): Promise<void> {
  console.log('🔍 renderMixedContent called with spec:', {
    title: spec.title,
    layout: spec.layout,
    hasParagraph: !!spec.paragraph,
    hasBullets: !!spec.bullets,
    bulletsLength: spec.bullets?.length,
    bullets: spec.bullets,
    hasRightImage: !!spec.right?.imagePrompt
  });

  let currentY = contentY;
  if (spec.paragraph) {
    console.log('📝 Adding paragraph:', spec.paragraph);
    addParagraph(slide, spec.paragraph, theme, 0.5, currentY, 4.5);
    currentY += 2.0;
  }
  if (spec.bullets) {
    console.log('🔸 Adding bullets:', spec.bullets);
    addBullets(slide, spec.bullets, theme, 0.5, currentY, 4.5);
  }
  if (spec.right?.imagePrompt) {
    console.log('🖼️ Adding image:', spec.right.imagePrompt);
    await addImage(slide, spec.right.imagePrompt, theme, 5.5, contentY, 4.0, 4.0, imageProcessor, slideContext);
  }
}

/**
 * Render image-right layout
 * Text on LEFT side (x: 0.5), image on RIGHT side (x: 5.5)
 */
async function renderImageRight(
  slide: pptxgen.Slide,
  spec: SlideSpec,
  theme: ProfessionalTheme,
  contentY: number,
  imageProcessor?: ImageProcessor,
  slideContext?: { title: string; layout: string; index: number; totalSlides: number }
): Promise<void> {
  let currentY = contentY;

  // Text content goes on the LEFT side
  if (spec.paragraph) {
    addParagraph(slide, spec.paragraph, theme, 0.5, currentY, 4.5);
    currentY += 2.0;
  }
  if (spec.bullets) {
    addBullets(slide, spec.bullets, theme, 0.5, currentY, 4.5);
  }
  // Add left column content if available
  if (spec.left && !spec.left.imagePrompt) {
    if (spec.left.paragraph) {
      addParagraph(slide, spec.left.paragraph, theme, 0.5, currentY, 4.5);
      currentY += 1.5;
    }
    if (spec.left.bullets) {
      addBullets(slide, spec.left.bullets, theme, 0.5, currentY, 4.5);
    }
  }

  // Image goes on the RIGHT side - check multiple locations
  if (spec.right?.imagePrompt) {
    await addImage(slide, spec.right.imagePrompt, theme, 5.5, contentY, 4.0, 4.0, imageProcessor, slideContext);
  }
  // Fallback: check left column for backward compatibility
  else if (spec.left && 'imagePrompt' in spec.left && spec.left.imagePrompt) {
    await addImage(slide, spec.left.imagePrompt, theme, 5.5, contentY, 4.0, 4.0, imageProcessor, slideContext);
  }
  // Fallback: check root imagePrompt
  else if (spec.imagePrompt) {
    await addImage(slide, spec.imagePrompt, theme, 5.5, contentY, 4.0, 4.0, imageProcessor, slideContext);
  }
}

/**
 * Render image-left layout
 * Image on LEFT side (x: 0.5), text on RIGHT side (x: 5.5)
 */
async function renderImageLeft(
  slide: pptxgen.Slide,
  spec: SlideSpec,
  theme: ProfessionalTheme,
  contentY: number,
  imageProcessor?: ImageProcessor,
  slideContext?: { title: string; layout: string; index: number; totalSlides: number }
): Promise<void> {
  let currentY = contentY;

  // Check for image in LEFT column (image-left layout)
  if (spec.left && 'imagePrompt' in spec.left && spec.left.imagePrompt) {
    await addImage(slide, spec.left.imagePrompt, theme, 0.5, contentY, 4.0, 4.0, imageProcessor, slideContext);
  }
  // Fallback: check right column for backward compatibility
  else if (spec.right && 'imagePrompt' in spec.right && spec.right.imagePrompt) {
    await addImage(slide, spec.right.imagePrompt, theme, 0.5, contentY, 4.0, 4.0, imageProcessor, slideContext);
  }
  // Fallback: check root imagePrompt
  else if (spec.imagePrompt) {
    await addImage(slide, spec.imagePrompt, theme, 0.5, contentY, 4.0, 4.0, imageProcessor, slideContext);
  }

  // Enhanced text content on the RIGHT side (B-5: Two-Column + Image Support)
  const rightColumnContent = {
    paragraph: spec.paragraph || spec.right?.paragraph,
    bullets: spec.bullets || spec.right?.bullets,
    heading: spec.right?.heading,
    metrics: spec.right?.metrics
  };

  // Use enhanced column content renderer for better mixed content support
  if (rightColumnContent.paragraph || rightColumnContent.bullets || rightColumnContent.heading || rightColumnContent.metrics) {
    await addColumnContent(slide, rightColumnContent as ExtendedColumnContent, theme, 5.5, currentY, 4.5, true, imageProcessor, slideContext);
  }
}

/**
 * Render full image layout
 */
async function renderImageFull(
  slide: pptxgen.Slide,
  spec: SlideSpec,
  theme: ProfessionalTheme,
  imageProcessor?: ImageProcessor,
  slideContext?: { title: string; layout: string; index: number; totalSlides: number }
): Promise<void> {
  const prompt = spec.right?.imagePrompt || 'default placeholder image';
  await addImage(slide, prompt, theme, 0.5, 1.5, 9.0, 5.0, imageProcessor, slideContext);
}

/**
 * Render comparison table
 */
function renderComparisonTable(slide: pptxgen.Slide, table: NonNullable<SlideSpec['comparisonTable']>, theme: ProfessionalTheme, contentY: number): void {
  const rows = [table.headers, ...table.rows];
  slide.addTable(rows.map(row => row.map(cell => ({ text: cell }))), {
    x: 0.5,
    y: contentY,
    w: 9.0,
    fontSize: Math.min(theme.typography.body.sizes.small, 12),
    color: safeColorFormat(theme.colors.text.primary)
    // Removed: fill, border (can cause corruption)
  });
}

/**
 * Render timeline with safe, compatible styling
 */
function renderTimeline(slide: pptxgen.Slide, timeline: NonNullable<SlideSpec['timeline']>, theme: ProfessionalTheme, contentY: number): void {
  let currentY = contentY;
  const itemSpacing = 0.8;

  timeline.forEach((item, index) => {
    // Date with enhanced styling (safe properties only)
    slide.addText(item.date || '', {
      x: 0.5,
      y: currentY,
      w: 1.5,
      h: 0.4,
      fontSize: Math.min(theme.typography.body.sizes.normal, 16),
      bold: true,
      color: safeColorFormat(theme.colors.primary),
      align: 'left'
    });

    // Title with professional styling (safe properties only)
    slide.addText(item.title || '', {
      x: 2.5,
      y: currentY,
      w: 6.5,
      h: 0.4,
      fontSize: Math.min(theme.typography.headings.sizes.h4, 18),
      bold: true,
      color: safeColorFormat(theme.colors.text.primary),
      align: 'left'
    });

    // Description with improved readability (safe properties only)
    if (item.description) {
      slide.addText(item.description, {
        x: 2.5,
        y: currentY + 0.4,
        w: 6.5,
        h: 0.4,
        fontSize: Math.min(theme.typography.body.sizes.small, 13),
        color: safeColorFormat(theme.colors.text.secondary),
        align: 'left'
      });
    }

    currentY += itemSpacing;
  });
}

/**
 * Render process flow
 */
function renderProcessFlow(slide: pptxgen.Slide, steps: NonNullable<SlideSpec['processSteps']>, theme: ProfessionalTheme, contentY: number): void {
  const stepWidth = 9.0 / steps.length;
  steps.forEach((step, i) => {
    const stepX = 0.5 + i * stepWidth;
    slide.addText(step.step.toString(), {
      x: stepX,
      y: contentY,
      w: stepWidth,
      fontSize: Math.min(theme.typography.body.sizes.normal, 16),
      color: safeColorFormat(theme.colors.primary),
      align: 'center'
    });
    slide.addText(step.title, {
      x: stepX,
      y: contentY + 0.5,
      w: stepWidth,
      fontSize: Math.min(theme.typography.body.sizes.small, 12),
      color: safeColorFormat(theme.colors.text.primary),
      align: 'center'
    });
    if (step.description) {
      slide.addText(step.description, {
        x: stepX,
        y: contentY + 1.0,
        w: stepWidth,
        fontSize: Math.min(theme.typography.body.sizes.tiny, 10),
        color: safeColorFormat(theme.colors.text.secondary),
        align: 'center'
      });
    }
  });
}

/**
 * Render before-after layout
 */
async function renderBeforeAfter(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, contentY: number): Promise<void> {
  if (spec.left) await addColumnContent(slide, spec.left as ExtendedColumnContent, theme, 0.5, contentY, 4.5);
  if (spec.right) await addColumnContent(slide, spec.right as ExtendedColumnContent, theme, 5.5, contentY, 4.5, true);
}

/**
 * Render problem-solution layout
 */
async function renderProblemSolution(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, contentY: number): Promise<void> {
  if (spec.left) await addColumnContent(slide, spec.left as ExtendedColumnContent, theme, 0.5, contentY, 4.5);
  if (spec.right) await addColumnContent(slide, spec.right as ExtendedColumnContent, theme, 5.5, contentY, 4.5, true);
}

/**
 * Enhanced layout rendering functions for modern presentations
 */

/**
 * Enhanced mixed content layout with better spacing and visual hierarchy
 */
async function renderEnhancedMixedContent(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, layoutConfig: any): Promise<void> {
  console.log('🔍 renderEnhancedMixedContent called');

  let currentY = layoutConfig.contentY;

  if (spec.paragraph) {
    console.log('📝 Adding enhanced paragraph');
    addEnhancedParagraph(slide, spec.paragraph, theme, layoutConfig.contentPadding, currentY, layoutConfig.columnWidth);
    currentY += 2.2;
  }

  if (spec.bullets) {
    console.log('🔸 Adding enhanced bullets');
    addEnhancedBullets(slide, spec.bullets, theme, layoutConfig.contentPadding, currentY, layoutConfig.columnWidth);
  }

  if (spec.right?.imagePrompt) {
    console.log('🖼️ Adding enhanced image');
    const imageX = layoutConfig.contentPadding + layoutConfig.columnWidth + layoutConfig.columnGap;
    await addEnhancedImage(slide, spec.right.imagePrompt, theme, imageX, layoutConfig.contentY, layoutConfig.columnWidth, 4.0);
  }
}

/**
 * Enhanced image-right layout
 */
async function renderEnhancedImageRight(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, layoutConfig: any): Promise<void> {
  let currentY = layoutConfig.contentY;

  // Text content on the LEFT with enhanced styling
  if (spec.paragraph) {
    addEnhancedParagraph(slide, spec.paragraph, theme, layoutConfig.contentPadding, currentY, layoutConfig.columnWidth);
    currentY += 2.2;
  }

  if (spec.bullets) {
    addEnhancedBullets(slide, spec.bullets, theme, layoutConfig.contentPadding, currentY, layoutConfig.columnWidth);
  }

  // Enhanced image on the RIGHT
  const imageX = layoutConfig.contentPadding + layoutConfig.columnWidth + layoutConfig.columnGap;
  if (spec.right?.imagePrompt) {
    await addEnhancedImage(slide, spec.right.imagePrompt, theme, imageX, layoutConfig.contentY, layoutConfig.columnWidth, 4.0);
  } else if (spec.imagePrompt) {
    await addEnhancedImage(slide, spec.imagePrompt, theme, imageX, layoutConfig.contentY, layoutConfig.columnWidth, 4.0);
  }
}

/**
 * Enhanced image-left layout
 */
async function renderEnhancedImageLeft(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, layoutConfig: any): Promise<void> {
  let currentY = layoutConfig.contentY;

  // Enhanced image on the LEFT
  if (spec.left?.imagePrompt) {
    await addEnhancedImage(slide, spec.left.imagePrompt, theme, layoutConfig.contentPadding, layoutConfig.contentY, layoutConfig.columnWidth, 4.0);
  } else if (spec.imagePrompt) {
    await addEnhancedImage(slide, spec.imagePrompt, theme, layoutConfig.contentPadding, layoutConfig.contentY, layoutConfig.columnWidth, 4.0);
  }

  // Text content on the RIGHT with enhanced styling
  const textX = layoutConfig.contentPadding + layoutConfig.columnWidth + layoutConfig.columnGap;
  if (spec.paragraph) {
    addEnhancedParagraph(slide, spec.paragraph, theme, textX, currentY, layoutConfig.columnWidth);
    currentY += 2.2;
  }

  if (spec.bullets) {
    addEnhancedBullets(slide, spec.bullets, theme, textX, currentY, layoutConfig.columnWidth);
  }
}

/**
 * Extended type for column content to include imagePrompt
 */
type ExtendedColumnContent = NonNullable<SlideSpec['left'] | SlideSpec['right']> & { imagePrompt?: string };

/**
 * Add column content (updated with extended type)
 */
async function addColumnContent(
  slide: pptxgen.Slide,
  content: ExtendedColumnContent,
  theme: ProfessionalTheme,
  x: number,
  y: number,
  w: number,
  isRight: boolean = false,
  imageProcessor?: ImageProcessor,
  slideContext?: { title: string; layout: string; index: number; totalSlides: number }
) {
  let currentY = y;

  if (content.heading) {
    slide.addText(content.heading, {
      x,
      y: currentY,
      w,
      h: 0.5,
      fontSize: Math.min(theme.typography.headings.sizes.h3, 20),
      bold: true,
      color: safeColorFormat(theme.colors.primary),
      align: 'left'
      // Removed: fontFace (can cause corruption)
    });
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

  // Enhanced image support for both left and right columns (B-5: Two-Column + Image Support)
  if (content.imagePrompt) {
    await addImage(slide, content.imagePrompt, theme, x, currentY, w, 3.0, imageProcessor, slideContext);
    currentY += 3.2; // Add space after image
  }

  // Enhanced metrics support for both columns
  if (content.metrics && content.metrics.length > 0) {
    content.metrics.forEach((metric, index) => {
      const metricY = currentY + (index * 0.8);
      addMetricCard(slide, metric.label, metric.value, metric.unit || '', theme, x, metricY, w, 0.6);
    });
    currentY += content.metrics.length * 0.8 + 0.2;
  }
}

/**
 * Enhanced visual elements for modern slide layouts
 */

/**
 * Add subtle slide background enhancement - DISABLED TO PREVENT CORRUPTION
 */
function addSlideBackground(slide: pptxgen.Slide, theme: ProfessionalTheme) {
  // TEMPORARILY DISABLED - Complex shapes can cause PowerPoint corruption
  console.log('⚠️ Slide background disabled to prevent corruption');
  return;
}

/**
 * Add decorative elements for title slides - DISABLED TO PREVENT CORRUPTION
 */
function addTitleSlideDecorations(slide: pptxgen.Slide, theme: ProfessionalTheme) {
  // TEMPORARILY DISABLED - Complex shapes can cause PowerPoint corruption
  console.log('⚠️ Title decorations disabled to prevent corruption');
  return;
}

/**
 * Add modern separator with enhanced styling (B-6: Modern Theme Rendering)
 * Safe implementation using text-based accent underlines
 */
function addModernSeparator(slide: pptxgen.Slide, theme: ProfessionalTheme, x: number, y: number, w: number, h: number) {
  // Use safe text-based accent underline instead of shapes
  const accentColor = theme.colors.accent || theme.colors.primary;

  // Create accent underline using text character
  slide.addText('━'.repeat(Math.floor(w * 10)), {
    x,
    y,
    w,
    h: h || 0.1,
    fontSize: Math.max(h * 72, 8), // Convert inches to points
    color: safeColorFormat(accentColor),
    align: 'left',
    fontFace: 'Arial',
    bold: true
  });
}

/**
 * Add modern card layout for content (B-6: Modern Theme Rendering)
 * Safe implementation using text-based styling
 */
function addModernCard(
  slide: pptxgen.Slide,
  content: string,
  theme: ProfessionalTheme,
  x: number,
  y: number,
  w: number,
  h: number,
  options: {
    title?: string;
    accentColor?: string;
    backgroundColor?: string;
  } = {}
): void {
  const accentColor = options.accentColor || theme.colors.accent || theme.colors.primary;
  const backgroundColor = options.backgroundColor || theme.colors.surface || '#FFFFFF';

  // Add card background using safe rectangle
  slide.addShape('rect', {
    x,
    y,
    w,
    h,
    fill: { color: backgroundColor },
    line: { color: safeColorFormat(accentColor), width: 1 },
    shadow: {
      type: 'outer',
      blur: 3,
      offset: 2,
      angle: 45,
      color: '00000020'
    }
  });

  // Add accent line at top of card
  slide.addShape('rect', {
    x,
    y,
    w,
    h: 0.05,
    fill: { color: safeColorFormat(accentColor) },
    line: { width: 0 }
  });

  let contentY = y + 0.15;

  // Add card title if provided
  if (options.title) {
    slide.addText(options.title, {
      x: x + 0.2,
      y: contentY,
      w: w - 0.4,
      h: 0.4,
      fontSize: TYPOGRAPHY_CONSTANTS.HEADING_SIZE,
      color: safeColorFormat(theme.colors.text.primary),
      fontFace: theme.typography.headings.fontFamily,
      bold: true,
      align: 'left'
    });
    contentY += 0.5;
  }

  // Add card content
  slide.addText(content, {
    x: x + 0.2,
    y: contentY,
    w: w - 0.4,
    h: h - (contentY - y) - 0.15,
    fontSize: TYPOGRAPHY_CONSTANTS.BODY_SIZE,
    color: safeColorFormat(theme.colors.text.primary),
    fontFace: theme.typography.body.fontFamily,
    align: 'left',
    valign: 'top'
  });
}

/**
 * Add enhanced column background with subtle styling
 */
function addColumnBackground(slide: pptxgen.Slide, theme: ProfessionalTheme, x: number, y: number, w: number, h: number, side: 'left' | 'right') {
  // TEMPORARILY DISABLED - Complex shapes can cause PowerPoint corruption
  console.log('⚠️ Column background disabled to prevent corruption');
  return;
}

/**
 * Enhanced bullet points with improved visual hierarchy (B-6: Modern Theme Rendering)
 * Supports both traditional and modern theme styling
 */
function addEnhancedBullets(slide: pptxgen.Slide, bullets: string[], theme: ProfessionalTheme, x: number, y: number, w: number) {
  const fontSize = Math.min(theme.typography.body.sizes.normal, 16); // Increased for better readability
  const lineHeight = 0.6; // Increased spacing for 16:9 format
  const maxHeight = 3.5; // Maximum content height for 16:9 format

  // Check if this is a modern theme for enhanced styling
  const isModern = 'palette' in theme;
  const accentColor = isModern ? (theme as any).palette.accent : theme.colors.accent;

  bullets.forEach((bullet, i) => {
    const bulletY = y + i * lineHeight;

    // Ensure bullets don't exceed slide boundaries
    if (bulletY + 0.5 > 5.625) return;

    // Modern theme: use accent-colored bullet points
    if (isModern) {
      // Add modern bullet point with accent color
      slide.addText('▶', {
        x: x,
        y: bulletY,
        w: 0.3,
        h: 0.5,
        fontSize: fontSize * 0.8,
        color: safeColorFormat(accentColor),
        align: 'left',
        valign: 'middle',
        fontFace: 'Arial',
        bold: true
      });

      // Add bullet text with modern typography
      slide.addText(bullet, {
        x: x + 0.4,
        y: bulletY,
        w: w - 0.4,
        h: 0.5,
        fontSize,
        color: safeColorFormat(theme.colors.text.primary),
        align: 'left',
        valign: 'top',
        fontFace: 'Arial',
        wrap: true
      });
    } else {
      // Traditional theme: standard bullet points
      slide.addText(`• ${bullet}`, {
        x: x,
        y: bulletY,
        w: w,
        h: 0.5,
        fontSize,
        color: safeColorFormat(theme.colors.text.primary),
        align: 'left',
        valign: 'top',
        fontFace: 'Arial',
        wrap: true
      });
    }
  });
}

/**
 * Legacy bullet function for compatibility
 */
function addBullets(slide: pptxgen.Slide, bullets: string[], theme: ProfessionalTheme, x: number, y: number, w: number) {
  return addEnhancedBullets(slide, bullets, theme, x, y, w);
}

/**
 * Enhanced paragraph with improved typography and visual appeal
 */
function addEnhancedParagraph(slide: pptxgen.Slide, text: string, theme: ProfessionalTheme, x: number, y: number, w: number, isQuote: boolean = false) {
  const fontSize = Math.min(isQuote ? theme.typography.body.sizes.large : theme.typography.body.sizes.normal, 18); // Increased for better readability
  const textColor = safeColorFormat(isQuote ? theme.colors.text.secondary : theme.colors.text.primary);
  const maxHeight = 3.5; // Maximum content height for 16:9 format

  slide.addText(text, {
    x,
    y,
    w,
    h: maxHeight, // Use available height in 16:9 format
    fontSize,
    color: textColor,
    align: isQuote ? 'center' : 'left',
    valign: 'top',
    italic: isQuote,
    lineSpacing: 120, // Improved line spacing for readability
    fontFace: 'Arial', // Force basic font for compatibility
    wrap: true // Enable text wrapping
  });
}

/**
 * Enhanced image with AI-powered processing and professional styling
 * Now uses the new ImageService for better quality and consistency
 */
async function addEnhancedImage(
  slide: pptxgen.Slide,
  prompt: string,
  theme: ProfessionalTheme,
  x: number,
  y: number,
  w: number,
  h: number,
  imageProcessor?: ImageProcessor,
  slideContext?: { title: string; layout: string; index: number; totalSlides: number }
) {
  console.log(`🎨 Generating AI-enhanced image: "${prompt.substring(0, 100)}..."`);

  try {
    // Import the image service
    const { imageService } = await import('./services/imageService');

    // Generate optimized prompt if image processor is available
    let optimizedPrompt = prompt;
    if (imageProcessor) {
      optimizedPrompt = imageProcessor.generateOptimizedPrompt(prompt, slideContext);
      console.log(`   🎯 Optimized prompt: "${optimizedPrompt.substring(0, 100)}..."`);
    }

    // Use the new image service with enhanced options
    const imageResult = await imageService.generateImage(optimizedPrompt, {
      style: 'professional',
      quality: 'high',
      aspectRatio: '16:9',
      enhanceColors: true,
      consistentStyling: true
    });

    console.log(`   ✓ Image generated successfully with enhanced processing`);

    if (imageResult && imageResult.url) {
      const imageUrl = imageResult.url;
      console.log(`   ✓ Enhanced image URL received: ${imageUrl}`);
      console.log(`   📊 Generation metadata:`, imageResult.metadata);

      let processedImageBuffer: Buffer;
      let processingStats: any = {};

      // Apply AI image processing if processor is available
      if (imageProcessor) {
        console.log(`   🔧 Applying AI image enhancements...`);
        const processingResult = await imageProcessor.processImage(imageUrl, optimizedPrompt, slideContext);
        processedImageBuffer = processingResult.buffer;
        processingStats = processingResult.metadata;

        console.log(`   ✅ Image processing complete: ${processingStats.processingSteps.join(' → ')}`);
        console.log(`   📊 Quality score: ${processingStats.qualityScore}%, Size: ${Math.round(processingStats.finalSize / 1024)}KB`);
      } else {
        // Fallback: download original image
        const axios = require('axios');
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        processedImageBuffer = Buffer.from(response.data);
        console.log(`   📥 Downloaded enhanced image: ${Math.round(processedImageBuffer.length / 1024)}KB`);
      }

      // Convert to base64 for PowerPoint
      const base64 = processedImageBuffer.toString('base64');

      // SIMPLIFIED IMAGE ADDITION - NO DECORATIVE ELEMENTS TO PREVENT CORRUPTION
      slide.addImage({
        data: `data:image/png;base64,${base64}`,
        x,
        y,
        w,
        h
        // Removed: rounding, shadows, borders to prevent corruption
      });

      console.log(`   ✅ AI-enhanced image added to slide at (${x}, ${y}) size ${w}x${h}`);

      // Log processing statistics if available
      if (processingStats.processingSteps) {
        console.log(`   📈 Applied enhancements: ${processingStats.processingSteps.join(', ')}`);
      }

    } else {
      throw new Error('No image URL returned from DALL-E');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ AI-enhanced image generation failed: ${errorMessage}`);

    // SIMPLIFIED ERROR PLACEHOLDER - NO COMPLEX SHAPES TO PREVENT CORRUPTION
    slide.addText('Image Generation Failed', {
      x,
      y: y + h / 2 - 0.3,
      w,
      h: 0.6,
      align: 'center',
      color: safeColorFormat('#666666'), // Simple gray color
      fontSize: 12
    });
  }
}

/**
 * Legacy image function for compatibility
 */
async function addImage(
  slide: pptxgen.Slide,
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

/**
 * Add chart with professional styling (legacy function)
 */
function addChart(slide: pptxgen.Slide, chart: NonNullable<SlideSpec['chart']>, theme: ProfessionalTheme, x: number, y: number, w: number, h: number) {
  return addEnhancedChart(slide, chart, theme, x, y, w, h);
}

// Showcase functions (completed with sample data for compilation)
export async function generateStyleShowcase(): Promise<Buffer> {
  const sampleSlides: SlideSpec[] = [
    { title: 'Sample Title', layout: 'title', design: {} }
    // Add more as needed
  ];
  return await generatePpt(sampleSlides, true);
}

export async function generateThemeShowcase(): Promise<Buffer> {
  const themeSlides: SlideSpec[] = [
    { title: 'Theme Sample', layout: 'title-paragraph', paragraph: 'Test', design: {} }
    // Add more as needed
  ];
  return await generatePpt(themeSlides, true);
}

/**
 * Additional enhanced layout functions
 */

/**
 * Enhanced chart rendering with modern styling
 */
function addEnhancedChart(slide: pptxgen.Slide, chart: NonNullable<SlideSpec['chart']>, theme: ProfessionalTheme, x: number, y: number, w: number, h: number) {
  // SIMPLIFIED CHART - NO BACKGROUND SHAPES TO PREVENT CORRUPTION
  console.log('📊 Adding simplified chart without decorative elements');

  // Map chart types to pptxgenjs format
  const chartTypeMap: Record<string, any> = {
    'bar': 'bar',
    'column': 'column',
    'line': 'line',
    'pie': 'pie',
    'doughnut': 'doughnut',
    'area': 'area',
    'scatter': 'scatter'
  };

  const pptxChartType = chartTypeMap[chart.type] || 'bar';

  const chartData = chart.series.map((s) => ({
    name: s.name,
    labels: chart.categories,
    values: s.data
  }));

  slide.addChart(pptxChartType, chartData, {
    x, y, w, h,
    title: chart.title,
    showLegend: chart.showLegend,
    showDataTable: chart.showDataLabels,
    chartColors: [
      safeColorFormat(theme.colors.primary),
      safeColorFormat(theme.colors.secondary),
      safeColorFormat(theme.colors.accent)
    ]
  });
}

/**
 * Enhanced timeline rendering
 */
function renderEnhancedTimeline(slide: pptxgen.Slide, timeline: NonNullable<SlideSpec['timeline']>, theme: ProfessionalTheme, contentY: number): void {
  const timelineY = contentY + 0.5;
  const itemWidth = 8.0 / timeline.length;

  // Draw timeline base line
  slide.addShape('rect', {
    x: 1.0,
    y: timelineY + 1.0,
    w: 8.0,
    h: 0.05,
    fill: { color: safeColorFormat(theme.colors.borders.medium) },
    line: { width: 0 }
  });

  timeline.forEach((item, i) => {
    const itemX = 1.0 + i * itemWidth;

    // Timeline point
    slide.addShape('ellipse', {
      x: itemX + itemWidth / 2 - 0.1,
      y: timelineY + 0.9,
      w: 0.2,
      h: 0.2,
      fill: { color: safeColorFormat(item.milestone ? theme.colors.accent : theme.colors.primary) },
      line: { width: 0 }
    });

    // Date
    if (item.date) {
      slide.addText(item.date, {
        x: itemX,
        y: timelineY + 1.3,
        w: itemWidth,
        fontSize: Math.min(theme.typography.body.sizes.small, 12),
        color: safeColorFormat(theme.colors.text.secondary),
        align: 'center'
      });
    }

    // Title
    if (item.title) {
      slide.addText(item.title, {
        x: itemX,
        y: timelineY + 0.2,
        w: itemWidth,
        fontSize: Math.min(theme.typography.body.sizes.normal, 14),
        color: safeColorFormat(theme.colors.text.primary),
        align: 'center',
        bold: true
      });
    }
  });
}

/**
 * Enhanced process flow rendering
 */
function renderEnhancedProcessFlow(slide: pptxgen.Slide, steps: NonNullable<SlideSpec['processSteps']>, theme: ProfessionalTheme, contentY: number): void {
  const stepWidth = 8.0 / steps.length;
  const stepY = contentY + 1.0;

  steps.forEach((step, i) => {
    const stepX = 1.0 + i * stepWidth;

    // Step background
    slide.addShape('rect', {
      x: stepX + 0.1,
      y: stepY,
      w: stepWidth - 0.2,
      h: 2.0,
      fill: {
        color: safeColorFormat(theme.colors.surface),
        transparency: 20
      },
      line: {
        color: safeColorFormat(theme.colors.primary),
        width: 2
      },
      rectRadius: 0.1
    });

    // Step number
    slide.addShape('ellipse', {
      x: stepX + stepWidth / 2 - 0.2,
      y: stepY + 0.1,
      w: 0.4,
      h: 0.4,
      fill: { color: safeColorFormat(theme.colors.primary) },
      line: { width: 0 }
    });

    slide.addText(step.step.toString(), {
      x: stepX + stepWidth / 2 - 0.2,
      y: stepY + 0.1,
      w: 0.4,
      h: 0.4,
      fontSize: 16,
      color: safeColorFormat(theme.colors.text.inverse),
      align: 'center',
      valign: 'middle',
      bold: true
    });

    // Step title
    slide.addText(step.title, {
      x: stepX + 0.15,
      y: stepY + 0.6,
      w: stepWidth - 0.3,
      fontSize: Math.min(theme.typography.body.sizes.normal, 14),
      color: safeColorFormat(theme.colors.text.primary),
      align: 'center',
      bold: true
    });

    // Arrow to next step
    if (i < steps.length - 1) {
      slide.addShape('triangle', {
        x: stepX + stepWidth - 0.1,
        y: stepY + 0.9,
        w: 0.2,
        h: 0.2,
        fill: { color: safeColorFormat(theme.colors.accent) },
        line: { width: 0 },
        flipH: false
      });
    }
  });
}

/**
 * Enhanced comparison table rendering
 */
function renderEnhancedComparisonTable(slide: pptxgen.Slide, table: NonNullable<SlideSpec['comparisonTable']>, theme: ProfessionalTheme, contentY: number): void {
  const tableX = 1.0;
  const tableY = contentY + 0.5;
  const tableW = 8.0;
  const colWidth = tableW / table.headers.length;
  const rowHeight = 0.6;

  // Table background
  slide.addShape('rect', {
    x: tableX - 0.1,
    y: tableY - 0.1,
    w: tableW + 0.2,
    h: (table.rows.length + 1) * rowHeight + 0.2,
    fill: {
      color: safeColorFormat(theme.colors.surface),
      transparency: 10
    },
    line: {
      color: safeColorFormat(theme.colors.borders.light),
      width: 1
    },
    rectRadius: 0.1
  });

  // Headers
  table.headers.forEach((header, i) => {
    const colX = tableX + i * colWidth;

    // Header background
    slide.addShape('rect', {
      x: colX,
      y: tableY,
      w: colWidth,
      h: rowHeight,
      fill: { color: safeColorFormat(theme.colors.primary) },
      line: {
        color: safeColorFormat(theme.colors.borders.medium),
        width: 1
      }
    });

    // Header text
    slide.addText(header, {
      x: colX + 0.1,
      y: tableY,
      w: colWidth - 0.2,
      h: rowHeight,
      fontSize: Math.min(theme.typography.body.sizes.normal, 14),
      color: safeColorFormat(theme.colors.text.inverse),
      align: 'center',
      valign: 'middle',
      bold: true
    });
  });

  // Rows
  table.rows.forEach((row, rowIndex) => {
    const rowY = tableY + (rowIndex + 1) * rowHeight;

    row.forEach((cell, colIndex) => {
      const colX = tableX + colIndex * colWidth;

      // Cell background (alternating colors)
      slide.addShape('rect', {
        x: colX,
        y: rowY,
        w: colWidth,
        h: rowHeight,
        fill: {
          color: safeColorFormat(rowIndex % 2 === 0 ? theme.colors.background : theme.colors.surface),
          transparency: 5
        },
        line: {
          color: safeColorFormat(theme.colors.borders.light),
          width: 1
        }
      });

      // Cell text
      slide.addText(cell, {
        x: colX + 0.1,
        y: rowY,
        w: colWidth - 0.2,
        h: rowHeight,
        fontSize: Math.min(theme.typography.body.sizes.small, 12),
        color: safeColorFormat(theme.colors.text.primary),
        align: 'center',
        valign: 'middle'
      });
    });
  });
}

/**
 * Enhanced before-after layout
 */
async function renderEnhancedBeforeAfter(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, layoutConfig: any): Promise<void> {
  // Add "Before" and "After" labels
  slide.addText('BEFORE', {
    x: layoutConfig.contentPadding,
    y: layoutConfig.contentY - 0.4,
    w: layoutConfig.columnWidth,
    h: 0.3,
    fontSize: Math.min(theme.typography.headings.sizes.h4, 16),
    color: safeColorFormat(theme.colors.primary),
    align: 'center',
    bold: true
  });

  const rightX = layoutConfig.contentPadding + layoutConfig.columnWidth + layoutConfig.columnGap;
  slide.addText('AFTER', {
    x: rightX,
    y: layoutConfig.contentY - 0.4,
    w: layoutConfig.columnWidth,
    h: 0.3,
    fontSize: Math.min(theme.typography.headings.sizes.h4, 16),
    color: safeColorFormat(theme.colors.accent),
    align: 'center',
    bold: true
  });

  // Add content
  if (spec.left) await addEnhancedColumnContent(slide, spec.left as ExtendedColumnContent, theme, layoutConfig.contentPadding, layoutConfig.contentY, layoutConfig.columnWidth);
  if (spec.right) await addEnhancedColumnContent(slide, spec.right as ExtendedColumnContent, theme, rightX, layoutConfig.contentY, layoutConfig.columnWidth, true);
}

/**
 * Enhanced problem-solution layout
 */
async function renderEnhancedProblemSolution(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, layoutConfig: any): Promise<void> {
  // Add "Problem" and "Solution" labels
  slide.addText('PROBLEM', {
    x: layoutConfig.contentPadding,
    y: layoutConfig.contentY - 0.4,
    w: layoutConfig.columnWidth,
    h: 0.3,
    fontSize: Math.min(theme.typography.headings.sizes.h4, 16),
    color: safeColorFormat(theme.colors.semantic.error),
    align: 'center',
    bold: true
  });

  const rightX = layoutConfig.contentPadding + layoutConfig.columnWidth + layoutConfig.columnGap;
  slide.addText('SOLUTION', {
    x: rightX,
    y: layoutConfig.contentY - 0.4,
    w: layoutConfig.columnWidth,
    h: 0.3,
    fontSize: Math.min(theme.typography.headings.sizes.h4, 16),
    color: safeColorFormat(theme.colors.semantic.success),
    align: 'center',
    bold: true
  });

  // Add content
  if (spec.left) await addEnhancedColumnContent(slide, spec.left as ExtendedColumnContent, theme, layoutConfig.contentPadding, layoutConfig.contentY, layoutConfig.columnWidth);
  if (spec.right) await addEnhancedColumnContent(slide, spec.right as ExtendedColumnContent, theme, rightX, layoutConfig.contentY, layoutConfig.columnWidth, true);
}

/**
 * Enhanced column content with improved styling
 */
async function addEnhancedColumnContent(slide: pptxgen.Slide, content: ExtendedColumnContent, theme: ProfessionalTheme, x: number, y: number, w: number, isRight: boolean = false) {
  let currentY = y;

  if (content.heading) {
    slide.addText(content.heading, {
      x,
      y: currentY,
      w,
      h: 0.5,
      fontSize: Math.min(theme.typography.headings.sizes.h3, 20),
      bold: true,
      color: safeColorFormat(theme.colors.primary),
      align: 'left'
    });
    currentY += 0.7;
  }

  if (content.paragraph) {
    addEnhancedParagraph(slide, content.paragraph, theme, x, currentY, w);
    currentY += 2.0;
  }

  if (content.bullets) {
    addEnhancedBullets(slide, content.bullets, theme, x, currentY, w);
    currentY += content.bullets.length * 0.6;
  }

  if (content.imagePrompt) {
    await addEnhancedImage(slide, content.imagePrompt, theme, x, currentY, w, 2.5);
  }
}

/**
 * Enhanced paragraph function for compatibility
 */
function addParagraph(slide: pptxgen.Slide, text: string, theme: ProfessionalTheme, x: number, y: number, w: number, isQuote: boolean = false) {
  return addEnhancedParagraph(slide, text, theme, x, y, w, isQuote);
}

/**
 * Advanced Visual Elements and Decorative Components
 */

/**
 * Add professional icon placeholder (since we can't use actual icon fonts in PowerPoint)
 */
function addIconPlaceholder(slide: pptxgen.Slide, iconName: string, theme: ProfessionalTheme, x: number, y: number, size: number = 0.3) {
  try {
    // Create a circular background for the icon
    slide.addShape('ellipse', {
      x,
      y,
      w: size,
      h: size,
      fill: { color: safeColorFormat(theme.colors.primary) },
      line: { width: 0 }
    });

    // Add icon text representation
    const iconMap: Record<string, string> = {
      'check': '✓',
      'star': '★',
      'heart': '♥',
      'arrow': '→',
      'warning': '⚠',
      'info': 'ℹ',
      'user': '👤',
      'chart': '📊',
      'calendar': '📅',
      'email': '✉',
      'phone': '📞',
      'location': '📍',
      'globe': '🌐',
      'gear': '⚙',
      'lightbulb': '💡'
    };

    const iconSymbol = iconMap[iconName.toLowerCase()] || '●';

    slide.addText(iconSymbol, {
      x,
      y,
      w: size,
      h: size,
      fontSize: Math.round(size * 40), // Scale font size with icon size
      color: safeColorFormat(theme.colors.text.inverse),
      align: 'center',
      valign: 'middle'
    });
  } catch (error) {
    console.warn('Failed to add icon placeholder, skipping:', error);
  }
}

/**
 * Add professional callout box
 */
function addCalloutBox(slide: pptxgen.Slide, text: string, theme: ProfessionalTheme, x: number, y: number, w: number, type: 'info' | 'warning' | 'success' | 'error' = 'info') {
  try {
    const colorMap = {
      info: theme.colors.semantic.info,
      warning: theme.colors.semantic.warning,
      success: theme.colors.semantic.success,
      error: theme.colors.semantic.error
    };

    const bgColor = colorMap[type];

    // Main callout background
    slide.addShape('rect', {
      x,
      y,
      w,
      h: 1.0,
      fill: {
        color: safeColorFormat(bgColor),
        transparency: 85
      },
      line: {
        color: safeColorFormat(bgColor),
        width: 2
      },
      rectRadius: 0.1
    });

    // Left accent bar
    slide.addShape('rect', {
      x,
      y,
      w: 0.05,
      h: 1.0,
      fill: { color: safeColorFormat(bgColor) },
      line: { width: 0 }
    });

    // Callout text
    slide.addText(text, {
      x: x + 0.2,
      y: y + 0.1,
      w: w - 0.3,
      h: 0.8,
      fontSize: Math.min(theme.typography.body.sizes.normal, 14),
      color: safeColorFormat(theme.colors.text.primary),
      align: 'left',
      valign: 'middle'
    });
  } catch (error) {
    console.warn('Failed to add callout box, skipping:', error);
  }
}

/**
 * Add progress bar visualization
 */
function addProgressBar(slide: pptxgen.Slide, label: string, percentage: number, theme: ProfessionalTheme, x: number, y: number, w: number) {
  try {
    // Label
    slide.addText(label, {
      x,
      y,
      w,
      h: 0.3,
      fontSize: Math.min(theme.typography.body.sizes.small, 12),
      color: safeColorFormat(theme.colors.text.primary),
      align: 'left'
    });

    // Progress bar background
    slide.addShape('rect', {
      x,
      y: y + 0.35,
      w,
      h: 0.2,
      fill: { color: safeColorFormat(theme.colors.borders.light) },
      line: { width: 0 },
      rectRadius: 0.1
    });

    // Progress bar fill
    const fillWidth = (w * percentage) / 100;
    slide.addShape('rect', {
      x,
      y: y + 0.35,
      w: fillWidth,
      h: 0.2,
      fill: { color: safeColorFormat(theme.colors.primary) },
      line: { width: 0 },
      rectRadius: 0.1
    });

    // Percentage text
    slide.addText(`${percentage}%`, {
      x: x + w + 0.1,
      y: y + 0.25,
      w: 0.5,
      h: 0.4,
      fontSize: Math.min(theme.typography.body.sizes.small, 12),
      color: safeColorFormat(theme.colors.text.secondary),
      align: 'left',
      valign: 'middle'
    });
  } catch (error) {
    console.warn('Failed to add progress bar, skipping:', error);
  }
}

/**
 * Add metric card with enhanced styling
 */
function addMetricCard(slide: pptxgen.Slide, label: string, value: string, unit: string, theme: ProfessionalTheme, x: number, y: number, w: number, h: number) {
  try {
    // Card background with gradient effect
    slide.addShape('rect', {
      x,
      y,
      w,
      h,
      fill: {
        color: safeColorFormat(theme.colors.surface),
        transparency: 10
      },
      line: {
        color: safeColorFormat(theme.colors.borders.medium),
        width: 1
      },
      rectRadius: 0.15
    });

    // Accent top border
    slide.addShape('rect', {
      x,
      y,
      w,
      h: 0.05,
      fill: { color: safeColorFormat(theme.colors.accent) },
      line: { width: 0 },
      rectRadius: 0.15
    });

    // Value (large text)
    slide.addText(value, {
      x: x + 0.1,
      y: y + 0.2,
      w: w - 0.2,
      h: h * 0.4,
      fontSize: Math.min(theme.typography.headings.sizes.h2, 28),
      color: safeColorFormat(theme.colors.primary),
      align: 'center',
      valign: 'middle',
      bold: true
    });

    // Unit (small text)
    if (unit) {
      slide.addText(unit, {
        x: x + 0.1,
        y: y + h * 0.5,
        w: w - 0.2,
        h: h * 0.2,
        fontSize: Math.min(theme.typography.body.sizes.small, 12),
        color: safeColorFormat(theme.colors.text.secondary),
        align: 'center',
        valign: 'middle'
      });
    }

    // Label (bottom)
    slide.addText(label, {
      x: x + 0.1,
      y: y + h * 0.7,
      w: w - 0.2,
      h: h * 0.25,
      fontSize: Math.min(theme.typography.body.sizes.normal, 14),
      color: safeColorFormat(theme.colors.text.primary),
      align: 'center',
      valign: 'middle'
    });
  } catch (error) {
    console.warn('Failed to add metric card, skipping:', error);
  }
}

/**
 * Add page numbers and footer to slide (B-3: Page Numbers & Footer)
 *
 * @param slide - The slide to add page numbers to
 * @param currentPage - Current slide number (1-based)
 * @param totalPages - Total number of slides
 * @param isTitleSlide - Whether this is a title slide (optional toggle)
 */
function addPageNumbersAndFooter(
  slide: pptxgen.Slide,
  currentPage: number,
  totalPages: number,
  isTitleSlide: boolean = false
): void {
  // Configuration for page numbers
  const showPageNumbersOnTitleSlide = false; // Configurable toggle

  // Skip page numbers on title slide if configured
  if (isTitleSlide && !showPageNumbersOnTitleSlide) {
    return;
  }

  // Page number positioning (bottom-right)
  const pageNumberX = SLIDE_DIMENSIONS.WIDTH - 1.0; // 1 inch from right edge
  const pageNumberY = SLIDE_DIMENSIONS.HEIGHT - 0.4; // 0.4 inches from bottom
  const pageNumberWidth = 0.8;
  const pageNumberHeight = 0.3;

  // Add page number text
  slide.addText(`${currentPage} / ${totalPages}`, {
    x: pageNumberX,
    y: pageNumberY,
    w: pageNumberWidth,
    h: pageNumberHeight,
    fontSize: TYPOGRAPHY_CONSTANTS.CAPTION_SIZE,
    color: '666666', // Gray color for subtle appearance
    align: 'right',
    fontFace: 'Arial', // Standard font for compatibility
    bold: false
  });

  // Optional footer text (can be configured)
  const includeFooter = false; // Configurable toggle
  const footerText = 'AI-Generated Presentation';

  if (includeFooter) {
    const footerX = LAYOUT_CONSTANTS.CONTENT_PADDING;
    const footerY = SLIDE_DIMENSIONS.HEIGHT - 0.4;
    const footerWidth = SLIDE_DIMENSIONS.WIDTH - LAYOUT_CONSTANTS.CONTENT_PADDING - 1.5; // Leave space for page numbers

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
    });
  }
}

/**
 * Validate chart data for rendering (B-4: Charts from Structured Spec)
 *
 * @param chart - Chart specification to validate
 * @returns Validation result with errors if any
 */
function validateChartData(chart: NonNullable<SlideSpec['chart']>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate chart type
  const supportedTypes = ['bar', 'line', 'pie', 'doughnut', 'area', 'scatter', 'column'];
  if (!supportedTypes.includes(chart.type)) {
    errors.push(`Unsupported chart type: ${chart.type}. Supported types: ${supportedTypes.join(', ')}`);
  }

  // Validate categories
  if (!chart.categories || chart.categories.length === 0) {
    errors.push('Chart must have at least one category');
  }

  // Validate series data
  if (!chart.series || chart.series.length === 0) {
    errors.push('Chart must have at least one data series');
  } else {
    chart.series.forEach((series, index) => {
      if (!series.name || series.name.trim() === '') {
        errors.push(`Series ${index + 1} must have a name`);
      }

      if (!series.data || series.data.length === 0) {
        errors.push(`Series ${index + 1} must have data points`);
      } else if (series.data.length !== chart.categories.length) {
        errors.push(`Series ${index + 1} data length (${series.data.length}) must match categories length (${chart.categories.length})`);
      }

      // Validate numeric data
      const hasInvalidData = series.data.some(value => typeof value !== 'number' || isNaN(value));
      if (hasInvalidData) {
        errors.push(`Series ${index + 1} contains invalid numeric data`);
      }
    });
  }

  // Special validation for pie/doughnut charts
  if ((chart.type === 'pie' || chart.type === 'doughnut') && chart.series.length > 1) {
    errors.push(`${chart.type} charts support only one data series`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Render chart fallback when chart data is invalid (B-4: Charts from Structured Spec)
 *
 * @param slide - Slide to render fallback on
 * @param chart - Chart specification
 * @param theme - Theme for styling
 * @param errors - Validation errors
 */
function renderChartFallback(
  slide: pptxgen.Slide,
  chart: NonNullable<SlideSpec['chart']>,
  theme: ProfessionalTheme,
  errors: string[]
): void {
  const fallbackX = 1.0;
  const fallbackY = LAYOUT_CONSTANTS.CONTENT_Y;
  const fallbackWidth = 8.0;

  // Add chart title if available
  if (chart.title) {
    slide.addText(chart.title, {
      x: fallbackX,
      y: fallbackY,
      w: fallbackWidth,
      h: 0.6,
      fontSize: TYPOGRAPHY_CONSTANTS.HEADING_SIZE,
      color: safeColorFormat(theme.colors.text.primary),
      fontFace: theme.typography.headings.fontFamily,
      bold: true,
      align: 'center'
    });
  }

  // Add error message
  slide.addText('📊 Chart Data Error', {
    x: fallbackX,
    y: fallbackY + 0.8,
    w: fallbackWidth,
    h: 0.5,
    fontSize: TYPOGRAPHY_CONSTANTS.BODY_SIZE,
    color: safeColorFormat(theme.colors.semantic?.error || '#DC2626'),
    fontFace: theme.typography.body.fontFamily,
    bold: true,
    align: 'center'
  });

  // Add error details
  const errorText = errors.join('\n• ');
  slide.addText(`• ${errorText}`, {
    x: fallbackX,
    y: fallbackY + 1.5,
    w: fallbackWidth,
    h: 2.0,
    fontSize: TYPOGRAPHY_CONSTANTS.SMALL_SIZE,
    color: safeColorFormat(theme.colors.text.secondary),
    fontFace: theme.typography.body.fontFamily,
    align: 'left'
  });

  // Add data summary if available
  if (chart.series && chart.series.length > 0) {
    let summaryText = '\n\nData Summary:\n';
    chart.series.forEach((series, index) => {
      if (series.name && series.data) {
        const validData = series.data.filter(val => typeof val === 'number' && !isNaN(val));
        summaryText += `${series.name}: ${validData.length} valid data points\n`;
      }
    });

    slide.addText(summaryText, {
      x: fallbackX,
      y: fallbackY + 3.8,
      w: fallbackWidth,
      h: 1.0,
      fontSize: TYPOGRAPHY_CONSTANTS.SMALL_SIZE,
      color: safeColorFormat(theme.colors.text.muted),
      fontFace: theme.typography.body.fontFamily,
      align: 'left'
    });
  }
}