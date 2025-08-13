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
import { validateSlideStyle, type StyleValidationResult } from './styleValidator';
import OpenAI from 'openai';
import { defineSecret } from 'firebase-functions/params';

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
 * Generate a PowerPoint file buffer from slide specifications
 * Enhanced with style validation and quality assurance
 *
 * @param specs - Array of slide specifications
 * @param validateStyles - Whether to perform style validation (default: true)
 * @returns Promise<Buffer> - PowerPoint file buffer
 */
export async function generatePpt(specs: SlideSpec[], validateStyles: boolean = true): Promise<Buffer> {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';

  // Style validation results for quality assurance
  const validationResults: StyleValidationResult[] = [];

  for (const spec of specs) {
    // Enhanced theme selection with dynamic selection and customization
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

    // Validate slide style quality if enabled
    if (validateStyles) {
      const styleValidation = validateSlideStyle(spec, theme);
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

    // Apply safe background color (avoid complex gradients)
    const bgColor = safeColorFormat(theme.colors.background);
    if (bgColor !== 'FFFFFF') { // Only set if not default white
      slide.background = { color: bgColor };
    }

    // Add title with safe styling properties
    slide.addText(spec.title, {
      x: 0.5,
      y: 0.3,
      w: 9.0,
      h: 1.2,
      fontSize: Math.min(theme.typography.headings.sizes.h1, 32), // Cap font size
      bold: true,
      color: safeColorFormat(theme.colors.primary),
      align: 'center',
      valign: 'middle'
      // Removed: fontFace, lineSpacing (can cause corruption)
    });

    // Enhanced dynamic layout handling with comprehensive support
    await renderSlideLayout(slide, spec, theme);

    // Add notes and sources (enhanced with formatting)
    let notesText = spec.notes || '';
    if (spec.sources?.length) notesText += `\n\nSources:\n${spec.sources.join('\n')}`;
    slide.addNotes(notesText);
  }

  // Write the presentation to buffer
  return (await pres.write({ outputType: 'nodebuffer' })) as Buffer;
}

/**
 * Comprehensive slide layout renderer supporting all layout types
 * Enhanced with improved spacing and professional positioning
 */
async function renderSlideLayout(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme): Promise<void> {
  const contentY = 1.8; // Adjusted starting Y position below title for better spacing
  const contentPadding = 0.5;
  const maxContentWidth = 9.0;

  switch (spec.layout) {
    case 'title':
      // Title only - no additional content needed
      break;

    case 'title-bullets':
      if (spec.bullets) addBullets(slide, spec.bullets, theme, contentPadding, contentY, maxContentWidth);
      break;

    case 'title-paragraph':
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, contentPadding, contentY, maxContentWidth);
      break;

    case 'two-column':
      addSeparator(slide, theme, 5.0, contentY, 0.1, 5.0); // Vertical separator

      if (spec.left) {
        addContentBackground(slide, theme, 0.5, contentY, 4.5, 4.0);
        await addColumnContent(slide, spec.left as ExtendedColumnContent, theme, 0.5, contentY, 4.5);
      }

      if (spec.right) {
        addContentBackground(slide, theme, 5.5, contentY, 4.5, 4.0);
        await addColumnContent(slide, spec.right as ExtendedColumnContent, theme, 5.5, contentY, 4.5, true);
      }
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
      await renderBeforeAfter(slide, spec, theme, contentY);
      break;

    case 'problem-solution':
      await renderProblemSolution(slide, spec, theme, contentY);
      break;

    case 'data-visualization':
      if (spec.chart) addChart(slide, spec.chart, theme, 1.0, contentY, 8.0, 4.0);
      break;

    case 'testimonial':
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, 1.0, contentY, 8.0, true);
      break;

    case 'team-intro':
    case 'contact-info':
    case 'thank-you':
    case 'agenda':
    case 'section-divider':
      // Standard content rendering with fallback
      if (spec.bullets) addBullets(slide, spec.bullets, theme, 1.0, contentY, 8.0);
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, 1.0, contentY, 8.0);
      break;

    default:
      // Fallback to basic content
      if (spec.bullets) addBullets(slide, spec.bullets, theme, 1.0, contentY, 8.0);
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, 1.0, contentY, 8.0);
      break;
  }
}

/**
 * Render mixed content layout
 */
async function renderMixedContent(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, contentY: number): Promise<void> {
  let currentY = contentY;
  if (spec.paragraph) {
    addParagraph(slide, spec.paragraph, theme, 0.5, currentY, 4.5);
    currentY += 2.0;
  }
  if (spec.bullets) {
    addBullets(slide, spec.bullets, theme, 0.5, currentY, 4.5);
  }
  if (spec.right?.imagePrompt) {
    await addImage(slide, spec.right.imagePrompt, theme, 5.5, contentY, 4.0, 4.0);
  }
}

/**
 * Render image-right layout
 */
async function renderImageRight(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, contentY: number): Promise<void> {
  let currentY = contentY;
  if (spec.paragraph) {
    addParagraph(slide, spec.paragraph, theme, 0.5, currentY, 4.5);
    currentY += 2.0;
  }
  if (spec.bullets) {
    addBullets(slide, spec.bullets, theme, 0.5, currentY, 4.5);
  }
  if (spec.right?.imagePrompt) {
    await addImage(slide, spec.right.imagePrompt, theme, 5.5, contentY, 4.0, 4.0);
  }
}

/**
 * Render image-left layout
 */
async function renderImageLeft(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, contentY: number): Promise<void> {
  let currentY = contentY;

  // Check for image in right column (since this is image-left layout)
  if (spec.right && 'imagePrompt' in spec.right && spec.right.imagePrompt) {
    await addImage(slide, spec.right.imagePrompt, theme, 0.5, contentY, 4.0, 4.0);
  }

  if (spec.paragraph) {
    addParagraph(slide, spec.paragraph, theme, 5.5, currentY, 4.5);
    currentY += 2.0;
  }
  if (spec.bullets) {
    addBullets(slide, spec.bullets, theme, 5.5, currentY, 4.5);
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
 * Render timeline
 */
function renderTimeline(slide: pptxgen.Slide, timeline: NonNullable<SlideSpec['timeline']>, theme: ProfessionalTheme, contentY: number): void {
  let currentY = contentY;
  timeline.forEach((item) => {
    slide.addText(item.date || '', {
      x: 0.5,
      y: currentY,
      w: 2.0,
      fontSize: Math.min(theme.typography.body.sizes.normal, 16),
      color: safeColorFormat(theme.colors.primary)
    });
    slide.addText(item.title || '', {
      x: 3.0,
      y: currentY,
      w: 6.0,
      fontSize: Math.min(theme.typography.body.sizes.normal, 16),
      color: safeColorFormat(theme.colors.text.primary)
    });
    if (item.description) {
      slide.addText(item.description, {
        x: 3.0,
        y: currentY + 0.4,
        w: 6.0,
        fontSize: Math.min(theme.typography.body.sizes.small, 12),
        color: safeColorFormat(theme.colors.text.secondary)
      });
    }
    currentY += 0.8;
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
 * Add separator (simplified to prevent corruption)
 */
function addSeparator(slide: pptxgen.Slide, theme: ProfessionalTheme, x: number, y: number, w: number, h: number) {
  slide.addShape(pptxgen.ShapeType.rect, {
    x,
    y,
    w,
    h,
    fill: { color: safeColorFormat(theme.colors.borders.light) }
    // Removed: complex styling (can cause corruption)
  });
}

/**
 * Add content background (simplified to prevent corruption)
 */
function addContentBackground(slide: pptxgen.Slide, theme: ProfessionalTheme, x: number, y: number, w: number, h: number) {
  slide.addShape(pptxgen.ShapeType.rect, {
    x,
    y,
    w,
    h,
    fill: { color: safeColorFormat(theme.colors.surface) }
    // Removed: transparency, line (can cause corruption)
  });
}

/**
 * Add bullets with professional styling
 */
function addBullets(slide: pptxgen.Slide, bullets: string[], theme: ProfessionalTheme, x: number, y: number, w: number) {
  bullets.forEach((bullet, i) => {
    slide.addText(bullet, {
      x,
      y: y + i * 0.5,
      w,
      h: 0.5,
      fontSize: Math.min(theme.typography.body.sizes.normal, 16), // Cap font size
      bullet: true,
      color: safeColorFormat(theme.colors.text.primary),
      align: 'left'
      // Removed: fontFace, lineSpacing (can cause corruption)
    });
  });
}

/**
 * Add paragraph with professional styling
 */
function addParagraph(slide: pptxgen.Slide, text: string, theme: ProfessionalTheme, x: number, y: number, w: number, isQuote: boolean = false) {
  slide.addText(text, {
    x,
    y,
    w,
    h: 2.0,
    fontSize: Math.min(isQuote ? theme.typography.body.sizes.large : theme.typography.body.sizes.normal, 18), // Cap font size
    color: safeColorFormat(theme.colors.text.primary),
    align: 'left',
    italic: isQuote
    // Removed: fontFace, lineSpacing (can cause corruption)
  });
}

/**
 * Add image with AI generation and fallback
 */
async function addImage(slide: pptxgen.Slide, prompt: string, theme: ProfessionalTheme, x: number, y: number, w: number, h: number) {
  try {
    const response = await getOpenAI().images.generate({
      model: 'dall-e-3',
      prompt: `${prompt}, professional, high-resolution, clean design`,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json'
    });

    if (response.data && response.data[0] && response.data[0].b64_json) {
      const base64 = response.data[0].b64_json;
      slide.addImage({
        data: `data:image/png;base64,${base64}`,
        x,
        y,
        w,
        h
      });
    } else {
      throw new Error('No image data returned');
    }
  } catch (error) {
    console.error('Failed to generate image:', error);
    slide.addShape(pptxgen.ShapeType.rect, {
      x,
      y,
      w,
      h,
      fill: { color: safeColorFormat(theme.colors.surface) }
      // Removed: line (can cause corruption)
    });
    slide.addText('Image Placeholder', {
      x,
      y: y + h / 2 - 0.2,
      w,
      h: 0.4,
      align: 'center',
      color: safeColorFormat(theme.colors.text.muted),
      fontSize: Math.min(theme.typography.body.sizes.small, 12)
    });
  }
}

/**
 * Add chart with professional styling
 */
function addChart(slide: pptxgen.Slide, chart: NonNullable<SlideSpec['chart']>, theme: ProfessionalTheme, x: number, y: number, w: number, h: number) {
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