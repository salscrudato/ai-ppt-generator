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

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';

  // 16:9 slide format constants
  const SLIDE_WIDTH = 10.0;    // Standard 16:9 slide width
  const SLIDE_HEIGHT = 5.625;  // Standard 16:9 slide height
  const contentPadding = 0.75; // Enhanced padding for 16:9 format
  const maxContentWidth = 8.5; // Optimized content width for 16:9

  // Style validation results for quality assurance
  const validationResults: StyleValidationResult[] = [];

  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];

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

    // Apply safe background color (avoid complex gradients)
    const bgColor = safeColorFormat(traditionalTheme.colors.background);
    if (bgColor !== 'FFFFFF') { // Only set if not default white
      slide.background = { color: bgColor };
    }

    // Optionally add a subtle background enhancement layer
    addSlideBackground(slide, traditionalTheme);

    // Simple, reliable title positioning
    const titleFontSize = Math.min(traditionalTheme.typography.headings.sizes.h1, 32);
    const titleColor = safeColorFormat(traditionalTheme.colors.primary);

    slide.addText(spec.title, {
      x: contentPadding,
      y: 0.4,
      w: maxContentWidth,
      h: 1.0,
      fontSize: titleFontSize,
      bold: true,
      color: titleColor,
      align: 'center',
      valign: 'middle',
      fontFace: 'Arial', // Force basic font for compatibility
      wrap: true // Enable text wrapping
    });

    // Add tasteful decorations for title slides
    if (spec.layout === 'title') {
      addTitleSlideDecorations(slide, traditionalTheme);
    }

    // Enhanced dynamic layout handling with comprehensive support
    await renderSlideLayout(slide, spec, traditionalTheme, contentPadding, maxContentWidth);

    // Footer: page number
    const pageNumber = `${i + 1}/${specs.length}`;
    slide.addText(pageNumber, {
      x: SLIDE_WIDTH - 1.5,
      y: SLIDE_HEIGHT - 0.4,
      w: 1.0,
      h: 0.3,
      fontSize: Math.min(traditionalTheme.typography.body.sizes.tiny, 10),
      color: safeColorFormat(traditionalTheme.colors.text.secondary),
      align: 'right',
      valign: 'middle'
    });

    // Enhanced speaker notes generation
    let notesText = generateSpeakerNotes(spec);
    if (spec.sources?.length) {
      notesText += `\n\nSources:\n${spec.sources.map((source, index) => `${index + 1}. ${source}`).join('\n')}`;
    }
    slide.addNotes(notesText);
  }

  // Write the presentation to buffer
  return (await pres.write({ outputType: 'nodebuffer' })) as Buffer;
}

/**
 * Comprehensive slide layout renderer supporting all layout types
 * Enhanced with improved spacing, professional positioning, and modern visual elements
 */
async function renderSlideLayout(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, contentPadding: number, maxContentWidth: number): Promise<void> {
  console.log('🎯 renderSlideLayout called with:', {
    title: spec.title,
    layout: spec.layout,
    hasBullets: !!spec.bullets,
    bulletsCount: spec.bullets?.length,
    hasRightImage: !!spec.right?.imagePrompt,
    hasLeftImage: !!spec.left?.imagePrompt
  });

  // Optimized 16:9 layout constants for professional spacing
  const contentY = 1.6;        // Optimized starting Y position below title
  const columnWidth = 4.0;     // Optimized column width for 16:9
  const columnGap = 0.5;       // Standard gap between columns

  switch (spec.layout) {
    case 'title':
      // Title already rendered by caller; keep slide clean
      break;

    case 'title-bullets':
      if (spec.bullets) addBullets(slide, spec.bullets, theme, contentPadding, contentY, maxContentWidth);
      break;

    case 'title-paragraph':
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, contentPadding, contentY, maxContentWidth);
      break;

    case 'two-column':
      if (spec.left) await addColumnContent(slide, spec.left as ExtendedColumnContent, theme, contentPadding, contentY, columnWidth);
      if (spec.right) await addColumnContent(slide, spec.right as ExtendedColumnContent, theme, contentPadding + columnWidth + columnGap, contentY, columnWidth, true);
      break;

    case 'mixed-content':
      await renderMixedContent(slide, spec, theme, contentY);
      break;

    case 'image-right':
      await renderImageRight(slide, spec, theme, contentY);
      break;

    case 'image-left':
      await renderImageLeft(slide, spec, theme, contentY);
      break;

    case 'image-full':
      await renderImageFull(slide, spec, theme);
      break;

    case 'quote':
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, 1.0, contentY, 8.0, true);
      break;

    case 'chart':
      if (spec.chart) addChart(slide, spec.chart, theme, 1.0, contentY, 8.0, 4.0);
      break;

    case 'comparison-table':
      if (spec.comparisonTable) renderComparisonTable(slide, spec.comparisonTable, theme, contentY);
      break;

    case 'timeline':
      if (spec.timeline) renderTimeline(slide, spec.timeline, theme, contentY);
      break;

    case 'process-flow':
      if (spec.processSteps) renderProcessFlow(slide, spec.processSteps, theme, contentY);
      break;

    case 'before-after':
    case 'problem-solution':
      // Both are two-column semantics
      await renderBeforeAfter(slide, spec, theme, contentY);
      break;

    case 'data-visualization':
      if (spec.chart) addChart(slide, spec.chart, theme, 1.0, contentY, 8.0, 4.0);
      break;

    case 'testimonial':
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, 1.0, contentY, 8.0, true);
      break;

    case 'team-intro':
    case 'contact-info':
      if (spec.bullets) addBullets(slide, spec.bullets, theme, 1.0, contentY, 8.0);
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, 1.0, contentY + 0.8, 8.0);
      break;

    case 'agenda':
      // Polished agenda layout with consistent spacing and separators
      slide.addText('Agenda', {
        x: contentPadding,
        y: contentY,
        w: maxContentWidth,
        h: 0.5,
        fontFace: theme.typography.headings.fontFamily,
        fontSize: theme.typography.headings.sizes.h2,
        bold: true,
        color: safeColorFormat(theme.colors.text.primary)
      });
      addModernSeparator(slide, theme, contentPadding, contentY + 0.6, maxContentWidth, 0.04);
      if (spec.bullets) addEnhancedBullets(slide, spec.bullets, theme, contentPadding, contentY + 0.9, maxContentWidth);
      break;

    case 'section-divider':
      // Section divider card
      slide.addShape('rect', {
        x: contentPadding,
        y: contentY + 0.4,
        w: maxContentWidth,
        h: 2.0,
        fill: { color: safeColorFormat(theme.colors.surface) },
        line: { width: 0 }
      });
      slide.addText(spec.title || 'Section', {
        x: contentPadding + 0.3,
        y: contentY + 0.6,
        w: maxContentWidth - 0.6,
        h: 1.0,
        fontFace: theme.typography.headings.fontFamily,
        fontSize: Math.min(theme.typography.headings.sizes.h1, 40),
        bold: true,
        color: safeColorFormat(theme.colors.primary)
      });
      break;

    case 'thank-you':
      slide.addText('Thank You', {
        x: 0,
        y: contentY + 1.0,
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
          x: 2.0, y: contentY + 2.2, w: 6.0, h: 1.5,
          align: 'center',
          fontFace: theme.typography.body.fontFamily,
          fontSize: theme.typography.body.sizes.normal,
          color: safeColorFormat(theme.colors.text.secondary)
        });
      }
      break;

    default:
      if (spec.bullets) addBullets(slide, spec.bullets, theme, contentPadding, contentY, maxContentWidth);
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, contentPadding, contentY, maxContentWidth);
      break;
  }
}

/**
 * Render mixed content layout
 */
async function renderMixedContent(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, contentY: number): Promise<void> {
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
    await addImage(slide, spec.right.imagePrompt, theme, 5.5, contentY, 4.0, 4.0);
  }
}

/**
 * Render image-right layout
 * Text on LEFT side (x: 0.5), image on RIGHT side (x: 5.5)
 */
async function renderImageRight(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, contentY: number): Promise<void> {
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
    await addImage(slide, spec.right.imagePrompt, theme, 5.5, contentY, 4.0, 4.0);
  }
  // Fallback: check left column for backward compatibility
  else if (spec.left && 'imagePrompt' in spec.left && spec.left.imagePrompt) {
    await addImage(slide, spec.left.imagePrompt, theme, 5.5, contentY, 4.0, 4.0);
  }
  // Fallback: check root imagePrompt
  else if (spec.imagePrompt) {
    await addImage(slide, spec.imagePrompt, theme, 5.5, contentY, 4.0, 4.0);
  }
}

/**
 * Render image-left layout
 * Image on LEFT side (x: 0.5), text on RIGHT side (x: 5.5)
 */
async function renderImageLeft(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, contentY: number): Promise<void> {
  let currentY = contentY;

  // Check for image in LEFT column (image-left layout)
  if (spec.left && 'imagePrompt' in spec.left && spec.left.imagePrompt) {
    await addImage(slide, spec.left.imagePrompt, theme, 0.5, contentY, 4.0, 4.0);
  }
  // Fallback: check right column for backward compatibility
  else if (spec.right && 'imagePrompt' in spec.right && spec.right.imagePrompt) {
    await addImage(slide, spec.right.imagePrompt, theme, 0.5, contentY, 4.0, 4.0);
  }
  // Fallback: check root imagePrompt
  else if (spec.imagePrompt) {
    await addImage(slide, spec.imagePrompt, theme, 0.5, contentY, 4.0, 4.0);
  }

  // Text content goes on the RIGHT side
  if (spec.paragraph) {
    addParagraph(slide, spec.paragraph, theme, 5.5, currentY, 4.5);
    currentY += 2.0;
  }
  if (spec.bullets) {
    addBullets(slide, spec.bullets, theme, 5.5, currentY, 4.5);
  }
  // Add right column content if available
  if (spec.right && !spec.right.imagePrompt) {
    if (spec.right.paragraph) {
      addParagraph(slide, spec.right.paragraph, theme, 5.5, currentY, 4.5);
      currentY += 1.5;
    }
    if (spec.right.bullets) {
      addBullets(slide, spec.right.bullets, theme, 5.5, currentY, 4.5);
    }
  }
}

/**
 * Render full image layout
 */
async function renderImageFull(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme): Promise<void> {
  const prompt = spec.right?.imagePrompt || 'default placeholder image';
  await addImage(slide, prompt, theme, 0.5, 1.5, 9.0, 5.0);
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
async function addColumnContent(slide: pptxgen.Slide, content: ExtendedColumnContent, theme: ProfessionalTheme, x: number, y: number, w: number, isRight: boolean = false) {
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

  if (content.imagePrompt && isRight) {
    await addImage(slide, content.imagePrompt, theme, x, currentY, w, 3.0);
  }
}

/**
 * Enhanced visual elements for modern slide layouts
 */

/**
 * Add subtle slide background enhancement
 */
function addSlideBackground(slide: pptxgen.Slide, theme: ProfessionalTheme) {
  try {
    // Add subtle gradient background
    slide.addShape('rect', {
      x: 0,
      y: 0,
      w: 10,
      h: 7.5,
      fill: {
        color: safeColorFormat(theme.colors.background),
        transparency: 5
      },
      line: { width: 0 }
    });
  } catch (error) {
    console.warn('Failed to add slide background, skipping:', error);
  }
}

/**
 * Add decorative elements for title slides
 */
function addTitleSlideDecorations(slide: pptxgen.Slide, theme: ProfessionalTheme) {
  try {
    // Add decorative accent line below title
    slide.addShape('rect', {
      x: 2.0,
      y: 2.0,
      w: 6.0,
      h: 0.05,
      fill: { color: safeColorFormat(theme.colors.accent) },
      line: { width: 0 }
    });

    // Add subtle corner accents
    slide.addShape('rect', {
      x: 0.2,
      y: 0.2,
      w: 1.5,
      h: 0.05,
      fill: { color: safeColorFormat(theme.colors.primary) },
      line: { width: 0 }
    });

    slide.addShape('rect', {
      x: 8.3,
      y: 7.0,
      w: 1.5,
      h: 0.05,
      fill: { color: safeColorFormat(theme.colors.primary) },
      line: { width: 0 }
    });
  } catch (error) {
    console.warn('Failed to add title decorations, skipping:', error);
  }
}

/**
 * Add modern separator with enhanced styling
 */
function addModernSeparator(slide: pptxgen.Slide, theme: ProfessionalTheme, x: number, y: number, w: number, h: number) {
  try {
    // Main separator line
    slide.addShape('rect', {
      x,
      y,
      w,
      h,
      fill: { color: safeColorFormat(theme.colors.borders.medium) },
      line: { width: 0 }
    });

    // Add subtle shadow effect
    slide.addShape('rect', {
      x: x + 0.02,
      y,
      w,
      h,
      fill: {
        color: safeColorFormat(theme.colors.borders.light),
        transparency: 50
      },
      line: { width: 0 }
    });
  } catch (error) {
    console.warn('Failed to add modern separator, skipping:', error);
  }
}

/**
 * Add enhanced column background with subtle styling
 */
function addColumnBackground(slide: pptxgen.Slide, theme: ProfessionalTheme, x: number, y: number, w: number, h: number, side: 'left' | 'right') {
  try {
    // Subtle background with rounded corners
    slide.addShape('rect', {
      x: x - 0.1,
      y: y - 0.1,
      w: w + 0.2,
      h: h + 0.2,
      fill: {
        color: safeColorFormat(theme.colors.surface),
        transparency: 15
      },
      line: {
        color: safeColorFormat(theme.colors.borders.light),
        width: 1
      },
      rectRadius: 0.1
    });

    // Add accent border on the appropriate side
    const accentX = side === 'left' ? x - 0.1 : x + w + 0.05;
    slide.addShape('rect', {
      x: accentX,
      y: y - 0.1,
      w: 0.05,
      h: h + 0.2,
      fill: { color: safeColorFormat(theme.colors.accent) },
      line: { width: 0 }
    });
  } catch (error) {
    console.warn('Failed to add column background, skipping:', error);
  }
}

/**
 * Enhanced bullet points with improved visual hierarchy
 */
function addEnhancedBullets(slide: pptxgen.Slide, bullets: string[], theme: ProfessionalTheme, x: number, y: number, w: number) {
  const fontSize = Math.min(theme.typography.body.sizes.normal, 16); // Increased for better readability
  const lineHeight = 0.6; // Increased spacing for 16:9 format
  const maxHeight = 3.5; // Maximum content height for 16:9 format

  bullets.forEach((bullet, i) => {
    const bulletY = y + i * lineHeight;

    // Ensure bullets don't exceed slide boundaries
    if (bulletY + 0.5 > 5.625) return;

    slide.addText(`• ${bullet}`, {
      x: x,
      y: bulletY,
      w: w,
      h: 0.5, // Increased height for better text rendering
      fontSize,
      color: safeColorFormat(theme.colors.text.primary),
      align: 'left',
      valign: 'top',
      fontFace: 'Arial', // Force basic font for compatibility
      wrap: true // Enable text wrapping
    });
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
 * Enhanced image with improved styling and border effects
 */
async function addEnhancedImage(slide: pptxgen.Slide, prompt: string, theme: ProfessionalTheme, x: number, y: number, w: number, h: number) {
  console.log(`🎨 Attempting to generate enhanced image with prompt: "${prompt.substring(0, 100)}..."`);

  try {
    const imageConfig = getImageModelConfig();
    console.log(`   Using ${imageConfig.model} (${imageConfig.size})`);

    const response = await getOpenAI().images.generate({
      model: imageConfig.model,
      prompt: `${prompt}${imageConfig.promptSuffix}`,
      n: 1,
      size: imageConfig.size,
      response_format: 'b64_json'
    });

    console.log(`   ✓ DALL-E API call successful`);

    if (response.data && response.data[0] && response.data[0].b64_json) {
      const base64 = response.data[0].b64_json;
      console.log(`   ✓ Image data received (${Math.round(base64.length / 1024)}KB base64)`);

      // Add subtle shadow background
      slide.addShape('rect', {
        x: x + 0.05,
        y: y + 0.05,
        w,
        h,
        fill: {
          color: safeColorFormat('#000000'),
          transparency: 85
        },
        line: { width: 0 },
        rectRadius: 0.1
      });

      // Add the main image with rounded corners
      slide.addImage({
        data: `data:image/png;base64,${base64}`,
        x,
        y,
        w,
        h,
        rounding: true
      });

      // Add subtle border
      slide.addShape('rect', {
        x,
        y,
        w,
        h,
        fill: { transparency: 100 },
        line: {
          color: safeColorFormat(theme.colors.borders.medium),
          width: 1
        },
        rectRadius: 0.1
      });

      console.log(`   ✓ Enhanced image added to slide at position (${x}, ${y}) size ${w}x${h}`);
    } else {
      throw new Error('No image data returned from DALL-E');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Enhanced image generation failed: ${errorMessage}`);

    // Enhanced placeholder with better styling
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
        color: safeColorFormat(theme.colors.primary),
        width: 2,
        dashType: 'dash'
      },
      rectRadius: 0.1
    });

    slide.addText('🖼️ Image Generation Failed', {
      x,
      y: y + h / 2 - 0.3,
      w,
      h: 0.6,
      align: 'center',
      color: safeColorFormat(theme.colors.text.muted),
      fontSize: Math.min(theme.typography.body.sizes.small, 12)
    });
  }
}

/**
 * Legacy image function for compatibility
 */
async function addImage(slide: pptxgen.Slide, prompt: string, theme: ProfessionalTheme, x: number, y: number, w: number, h: number) {
  return addEnhancedImage(slide, prompt, theme, x, y, w, h);
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
 * Generate comprehensive speaker notes from slide content
 */
function generateSpeakerNotes(spec: SlideSpec): string {
  // Use existing notes if provided
  if (spec.notes && spec.notes.trim().length > 0) {
    return spec.notes;
  }

  // Auto-generate notes based on slide content
  let notes = '';

  // Add title context
  notes += `Slide Title: ${spec.title}\n\n`;

  // Add layout-specific guidance
  switch (spec.layout) {
    case 'title':
      notes += 'This is a title slide. Use it to introduce the presentation topic and set the stage for your audience.\n\n';
      if (spec.paragraph) {
        notes += `Key Message: ${spec.paragraph}\n\n`;
      }
      break;

    case 'title-bullets':
      notes += 'This slide presents key points in a structured format. Elaborate on each bullet point:\n\n';
      if (spec.bullets && spec.bullets.length > 0) {
        spec.bullets.forEach((bullet, index) => {
          notes += `${index + 1}. ${bullet}\n   - Expand on this point with examples or supporting details\n\n`;
        });
      }
      break;

    case 'title-paragraph':
      notes += 'This slide contains detailed information. Present the content clearly and allow time for questions.\n\n';
      if (spec.paragraph) {
        notes += `Main Content: ${spec.paragraph}\n\n`;
        notes += 'Speaking Tips:\n- Break down complex concepts into digestible parts\n- Use examples to illustrate key points\n- Check audience understanding\n\n';
      }
      break;

    case 'two-column':
      notes += 'This slide compares or contrasts two concepts. Present each side clearly:\n\n';
      if (spec.left?.bullets) {
        notes += 'Left Column Points:\n';
        spec.left.bullets.forEach((bullet, index) => {
          notes += `- ${bullet}\n`;
        });
        notes += '\n';
      }
      if (spec.right?.bullets) {
        notes += 'Right Column Points:\n';
        spec.right.bullets.forEach((bullet, index) => {
          notes += `- ${bullet}\n`;
        });
        notes += '\n';
      }
      notes += 'Highlight the relationship between the two columns and draw conclusions.\n\n';
      break;

    case 'chart':
      notes += 'This slide presents data visualization. Guide the audience through the chart:\n\n';
      if (spec.chart) {
        notes += `Chart Type: ${spec.chart.type}\n`;
        notes += `Data Categories: ${spec.chart.categories.join(', ')}\n\n`;
        notes += 'Speaking Tips:\n';
        notes += '- Start with the main insight or trend\n';
        notes += '- Point out significant data points\n';
        notes += '- Explain what the data means for your audience\n';
        notes += '- Be prepared to answer questions about methodology\n\n';
      }
      break;

    case 'quote':
      notes += 'This slide features a quote. Use it to emphasize a key message:\n\n';
      if (spec.paragraph) {
        notes += `Quote: "${spec.paragraph}"\n\n`;
        notes += 'Speaking Tips:\n';
        notes += '- Pause before and after reading the quote\n';
        notes += '- Explain why this quote is relevant\n';
        notes += '- Connect it to your main message\n\n';
      }
      break;

    case 'timeline':
      notes += 'This slide shows a sequence of events or process steps. Walk through each item chronologically:\n\n';
      if (spec.timeline) {
        spec.timeline.forEach((item, index) => {
          notes += `${index + 1}. ${item.date || `Step ${index + 1}`}: ${item.title}\n`;
          if (item.description) {
            notes += `   ${item.description}\n`;
          }
          notes += '\n';
        });
      }
      notes += 'Emphasize the progression and key milestones.\n\n';
      break;

    case 'process-flow':
      notes += 'This slide outlines a process or workflow. Explain each step clearly:\n\n';
      if (spec.processFlow) {
        spec.processFlow.forEach((step, index) => {
          notes += `Step ${index + 1}: ${step.title}\n`;
          if (step.description) {
            notes += `   ${step.description}\n`;
          }
          notes += '\n';
        });
      }
      notes += 'Show how each step connects to the next and the overall outcome.\n\n';
      break;

    default:
      notes += 'Present this slide content clearly and engage with your audience.\n\n';
      if (spec.paragraph) {
        notes += `Content: ${spec.paragraph}\n\n`;
      }
      if (spec.bullets && spec.bullets.length > 0) {
        notes += 'Key Points:\n';
        spec.bullets.forEach(bullet => {
          notes += `- ${bullet}\n`;
        });
        notes += '\n';
      }
  }

  // Add general presentation tips
  notes += 'General Tips:\n';
  notes += '- Maintain eye contact with your audience\n';
  notes += '- Speak clearly and at an appropriate pace\n';
  notes += '- Use gestures to emphasize key points\n';
  notes += '- Be prepared for questions\n';
  notes += '- Transition smoothly to the next slide\n';

  return notes.trim();
}

/**
 * Additional enhanced layout functions
 */

/**
 * Enhanced chart rendering with modern styling
 */
function addEnhancedChart(slide: pptxgen.Slide, chart: NonNullable<SlideSpec['chart']>, theme: ProfessionalTheme, x: number, y: number, w: number, h: number) {
  try {
    // Validate chart data
    if (!chart.categories || chart.categories.length === 0) {
      console.warn('Chart has no categories, skipping chart rendering');
      return;
    }

    if (!chart.series || chart.series.length === 0) {
      console.warn('Chart has no data series, skipping chart rendering');
      return;
    }

    // Add chart background with subtle styling
    slide.addShape('rect', {
      x: x - 0.1,
      y: y - 0.1,
      w: w + 0.2,
      h: h + 0.2,
      fill: {
        color: safeColorFormat(theme.colors.surface || theme.colors.background || '#FFFFFF'),
        transparency: 10
      },
      line: {
        color: safeColorFormat(theme.colors.borders?.light || theme.colors.text?.secondary || '#E5E7EB'),
        width: 1
      },
      rectRadius: 0.1,
      shadow: {
        type: 'outer',
        blur: 3,
        offset: 2,
        angle: 45,
        color: '00000015'
      }
    });

    // Enhanced chart type mapping with validation
    const chartTypeMap: Record<string, any> = {
      'bar': 'bar',
      'column': 'column',
      'line': 'line',
      'pie': 'pie',
      'doughnut': 'doughnut',
      'area': 'area',
      'scatter': 'scatter'
    };

    const pptxChartType = chartTypeMap[chart.type] || 'column';

    // Prepare chart data with validation
    const chartData = chart.series.map((series, index) => {
      // Ensure data array matches categories length
      const normalizedData = chart.categories.map((_, catIndex) =>
        series.data[catIndex] !== undefined ? series.data[catIndex] : 0
      );

      return {
        name: series.name || `Series ${index + 1}`,
        labels: chart.categories,
        values: normalizedData
      };
    });

    // Enhanced color palette for multiple series
    const chartColors = [
      safeColorFormat(theme.colors.primary),
      safeColorFormat(theme.colors.secondary),
      safeColorFormat(theme.colors.accent),
      safeColorFormat('#10B981'), // Green
      safeColorFormat('#F59E0B'), // Amber
      safeColorFormat('#EF4444'), // Red
      safeColorFormat('#8B5CF6'), // Purple
      safeColorFormat('#06B6D4')  // Cyan
    ];

    // Chart configuration with enhanced styling
    const chartOptions: any = {
      x, y, w, h,
      title: chart.title || '',
      titleFontSize: 14,
      titleColor: safeColorFormat(theme.colors.text?.primary || theme.colors.primary),
      showLegend: chart.showLegend !== false,
      legendPos: 'r',
      showDataTable: chart.showDataLabels === true,
      chartColors: chartColors.slice(0, chart.series.length),
      border: {
        pt: 1,
        color: safeColorFormat(theme.colors.text?.secondary || theme.colors.secondary)
      }
    };

    // Type-specific enhancements
    if (chart.type === 'pie' || chart.type === 'doughnut') {
      chartOptions.showPercent = true;
      chartOptions.showValue = false;
      chartOptions.showLegend = true;
      chartOptions.legendPos = 'r';
    } else {
      chartOptions.catAxisLabelFontSize = 10;
      chartOptions.valAxisLabelFontSize = 10;
      chartOptions.showValue = chart.showDataLabels === true;
    }

    // Add subtitle if provided
    if (chart.subtitle) {
      slide.addText(chart.subtitle, {
        x: x,
        y: y - 0.4,
        w: w,
        h: 0.3,
        fontSize: 11,
        color: safeColorFormat(theme.colors.text?.secondary || theme.colors.secondary),
        align: 'center',
        fontFace: theme.typography?.fontFamilies?.body || 'Arial'
      });
    }

    // Render the chart
    slide.addChart(pptxChartType, chartData, chartOptions);

    console.log(`✅ Successfully added ${chart.type} chart with ${chart.series.length} series and ${chart.categories.length} categories`);

  } catch (error) {
    console.error('❌ Error rendering chart:', error);

    // Fallback: Add error message
    slide.addText('Chart data could not be displayed', {
      x: x,
      y: y + h/2 - 0.2,
      w: w,
      h: 0.4,
      fontSize: 12,
      color: safeColorFormat(theme.colors.text?.secondary || theme.colors.secondary),
      align: 'center',
      italic: true
    });
  }
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