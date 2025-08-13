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
 * - AI-generated image integration via DALL-E 3
 * - Professional theme system with brand customization
 * - Dynamic positioning and responsive sizing
 * - Enhanced typography and visual hierarchy
 * - Robust error handling and fallback mechanisms
 *
 * @version 3.3.0-enhanced
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

      // Log style issues for debugging (in development)
      if (styleValidation.issues.length > 0) {
        console.log(`Style validation for slide "${spec.title}":`, {
          score: styleValidation.score,
          grade: styleValidation.grade,
          issues: styleValidation.issues.map(i => i.message)
        });
      }
    }

    const slide = pres.addSlide();

    // Apply enhanced theme background with subtle gradient
    if (theme.effects.gradients.background.includes('gradient')) {
      // For gradient backgrounds, use a subtle pattern
      slide.background = {
        color: theme.colors.background.replace('#', ''),
        transparency: 5
      };
    } else {
      slide.background = {
        color: theme.colors.background.replace('#', '')
      };
    }

    // Add title with enhanced modern styling
    slide.addText(spec.title, {
      x: 0.5, y: 0.3, w: 9.0, h: 1.2,
      fontSize: theme.typography.headings.sizes.h1,
      bold: true,
      color: theme.colors.primary.replace('#', ''),
      align: 'center',
      fontFace: theme.typography.headings.fontFamily,

      valign: 'middle',
      lineSpacing: Math.max(100, Math.min(300, Math.round(theme.typography.headings.lineHeight.tight * 100)))
    });

    // Enhanced dynamic layout handling with comprehensive support
    await renderSlideLayout(slide, spec, theme);

    // Add notes and sources
    let notesText = spec.notes || '';
    if (spec.sources) notesText += `\nSources: ${spec.sources.join('; ')}`;
    slide.addNotes(notesText);
  }

  return await pres.write({ outputType: 'nodebuffer' }) as Buffer;
}

/**
 * Comprehensive slide layout renderer supporting all layout types
 * Enhanced with improved spacing and professional positioning
 */
async function renderSlideLayout(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme): Promise<void> {
  const contentY = theme.layout.margins.top + 1.4; // Starting Y position below title with enhanced spacing
  const contentPadding = theme.layout.contentArea.padding;
  const maxContentWidth = theme.layout.contentArea.maxWidth;

  switch (spec.layout) {
    case 'title':
      // Title only - no additional content
      break;

    case 'title-bullets':
      if (spec.bullets) addBullets(slide, spec.bullets, theme, contentPadding, contentY, maxContentWidth);
      break;

    case 'title-paragraph':
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, contentPadding, contentY, maxContentWidth);
      break;

    case 'two-column':
      // Add visual separator between columns
      addSeparator(slide, theme, 5.0, contentY, 0.1);

      // Add subtle background for left column
      if (spec.left) {
        addContentBackground(slide, theme, 0.5, contentY, 4.5, 3.5);
        addColumnContent(slide, spec.left, theme, 0.5, contentY, 4.5);
      }

      // Add subtle background for right column
      if (spec.right) {
        addContentBackground(slide, theme, 5.5, contentY, 4.5, 3.5);
        await addColumnContent(slide, spec.right, theme, 5.5, contentY, 4.5, true);
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
      if (spec.paragraph) addParagraph(slide, `"${spec.paragraph}"`, theme, 1.0, contentY, 8.0, true);
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
      if (spec.paragraph) addParagraph(slide, `"${spec.paragraph}"`, theme, 1.0, contentY, 8.0, true);
      break;

    case 'team-intro':
    case 'contact-info':
    case 'thank-you':
    case 'agenda':
    case 'section-divider':
      // Use standard content rendering for these layouts
      if (spec.bullets) addBullets(slide, spec.bullets, theme, 1.0, contentY, 8.0);
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, 1.0, contentY, 8.0);
      break;

    default:
      // Fallback to basic content rendering
      if (spec.bullets) addBullets(slide, spec.bullets, theme, 1.0, contentY, 8.0);
      if (spec.paragraph) addParagraph(slide, spec.paragraph, theme, 1.0, contentY, 8.0);
      break;
  }
}

/**
 * Specialized layout rendering functions
 */
async function renderMixedContent(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, contentY: number): Promise<void> {
  let currentY = contentY;
  if (spec.paragraph) {
    addParagraph(slide, spec.paragraph, theme, 1.0, currentY, 4.0);
    currentY += 2.0;
  }
  if (spec.bullets) {
    addBullets(slide, spec.bullets, theme, 1.0, currentY, 4.0);
  }
  if (spec.right) {
    await addColumnContent(slide, spec.right, theme, 5.5, contentY, 4.0, true);
  }
}

async function renderImageRight(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, contentY: number): Promise<void> {
  const leftWidth = 5.0;
  let currentY = contentY;

  if (spec.paragraph) {
    addParagraph(slide, spec.paragraph, theme, 0.5, currentY, leftWidth);
    currentY += 2.0;
  }
  if (spec.bullets) {
    addBullets(slide, spec.bullets, theme, 0.5, currentY, leftWidth);
  }
  if (spec.right?.imagePrompt) {
    await addImage(slide, spec.right.imagePrompt, theme, 6.0, contentY, 4.0, 4.0);
  }
}

async function renderImageLeft(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, contentY: number): Promise<void> {
  const rightWidth = 5.0;
  let currentY = contentY;

  // For image-left layout, we'll use a placeholder or check for image in right column
  const imagePrompt = spec.right?.imagePrompt;
  if (imagePrompt) {
    await addImage(slide, imagePrompt, theme, 0.5, contentY, 4.0, 4.0);
  }
  if (spec.paragraph) {
    addParagraph(slide, spec.paragraph, theme, 5.0, currentY, rightWidth);
    currentY += 2.0;
  }
  if (spec.bullets) {
    addBullets(slide, spec.bullets, theme, 5.0, currentY, rightWidth);
  }
}

async function renderImageFull(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme): Promise<void> {
  const imagePrompt = spec.right?.imagePrompt;
  if (imagePrompt) {
    await addImage(slide, imagePrompt, theme, 0.5, 1.5, 9.0, 5.5);
  }
}

function renderComparisonTable(slide: pptxgen.Slide, table: NonNullable<SlideSpec['comparisonTable']>, theme: ProfessionalTheme, contentY: number): void {
  // Convert string arrays to table cell format
  const tableData = [
    table.headers.map(header => ({ text: header, options: { bold: true } })),
    ...table.rows.map(row => row.map(cell => ({ text: cell })))
  ];

  slide.addTable(tableData, {
    x: 1.0, y: contentY, w: 8.0, h: 4.0,
    fontSize: theme.typography.body.sizes.normal,
    fontFace: theme.typography.body.fontFamily,
    color: theme.colors.text.primary.replace('#', ''),
    fill: { color: theme.colors.surface.replace('#', '') },
    border: { pt: 1, color: theme.colors.primary.replace('#', '') }
  });
}

function renderTimeline(slide: pptxgen.Slide, timeline: NonNullable<SlideSpec['timeline']>, theme: ProfessionalTheme, contentY: number): void {
  let currentY = contentY;
  const itemHeight = 0.8;

  timeline.forEach((item) => {
    // Date/milestone marker
    slide.addText(item.date, {
      x: 0.5, y: currentY, w: 2.0, h: itemHeight,
      fontSize: theme.typography.body.sizes.small,
      bold: item.milestone,
      color: theme.colors.primary.replace('#', ''),
      fontFace: theme.typography.body.fontFamily
    });

    // Title and description
    slide.addText(item.title, {
      x: 3.0, y: currentY, w: 6.0, h: itemHeight,
      fontSize: theme.typography.body.sizes.normal,
      bold: true,
      color: theme.colors.text.primary.replace('#', ''),
      fontFace: theme.typography.body.fontFamily
    });

    if (item.description) {
      slide.addText(item.description, {
        x: 3.0, y: currentY + 0.4, w: 6.0, h: itemHeight,
        fontSize: theme.typography.body.sizes.small,
        color: theme.colors.text.secondary.replace('#', ''),
        fontFace: theme.typography.body.fontFamily
      });
    }

    currentY += itemHeight + 0.3;
  });
}

function renderProcessFlow(slide: pptxgen.Slide, steps: NonNullable<SlideSpec['processSteps']>, theme: ProfessionalTheme, contentY: number): void {
  const stepWidth = 8.0 / steps.length;

  steps.forEach((step, index) => {
    const x = 1.0 + (index * stepWidth);

    // Step number circle
    slide.addText(step.step.toString(), {
      x: x + stepWidth/2 - 0.3, y: contentY, w: 0.6, h: 0.6,
      fontSize: theme.typography.body.sizes.normal,
      bold: true,
      color: theme.colors.text.inverse.replace('#', ''),
      fill: { color: theme.colors.primary.replace('#', '') },
      align: 'center',
      valign: 'middle',
      fontFace: theme.typography.body.fontFamily
    });

    // Step title
    slide.addText(step.title, {
      x: x, y: contentY + 0.8, w: stepWidth - 0.2, h: 0.6,
      fontSize: theme.typography.body.sizes.small,
      bold: true,
      color: theme.colors.text.primary.replace('#', ''),
      align: 'center',
      fontFace: theme.typography.body.fontFamily
    });

    // Step description
    if (step.description) {
      slide.addText(step.description, {
        x: x, y: contentY + 1.5, w: stepWidth - 0.2, h: 1.5,
        fontSize: theme.typography.body.sizes.small,
        color: theme.colors.text.secondary.replace('#', ''),
        align: 'center',
        fontFace: theme.typography.body.fontFamily
      });
    }
  });
}

async function renderBeforeAfter(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, contentY: number): Promise<void> {
  // Left side - "Before"
  if (spec.left) {
    slide.addText('Before', {
      x: 0.5, y: contentY - 0.5, w: 4.5, h: 0.5,
      fontSize: theme.typography.headings.sizes.h3,
      bold: true,
      color: theme.colors.text.secondary.replace('#', ''),
      align: 'center',
      fontFace: theme.typography.headings.fontFamily
    });
    addColumnContent(slide, spec.left, theme, 0.5, contentY, 4.5);
  }

  // Right side - "After"
  if (spec.right) {
    slide.addText('After', {
      x: 5.5, y: contentY - 0.5, w: 4.5, h: 0.5,
      fontSize: theme.typography.headings.sizes.h3,
      bold: true,
      color: theme.colors.primary.replace('#', ''),
      align: 'center',
      fontFace: theme.typography.headings.fontFamily
    });
    await addColumnContent(slide, spec.right, theme, 5.5, contentY, 4.5, true);
  }
}

async function renderProblemSolution(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, contentY: number): Promise<void> {
  // Left side - "Problem"
  if (spec.left) {
    slide.addText('Problem', {
      x: 0.5, y: contentY - 0.5, w: 4.5, h: 0.5,
      fontSize: theme.typography.headings.sizes.h3,
      bold: true,
      color: theme.colors.text.secondary.replace('#', ''),
      align: 'center',
      fontFace: theme.typography.headings.fontFamily
    });
    addColumnContent(slide, spec.left, theme, 0.5, contentY, 4.5);
  }

  // Right side - "Solution"
  if (spec.right) {
    slide.addText('Solution', {
      x: 5.5, y: contentY - 0.5, w: 4.5, h: 0.5,
      fontSize: theme.typography.headings.sizes.h3,
      bold: true,
      color: theme.colors.primary.replace('#', ''),
      align: 'center',
      fontFace: theme.typography.headings.fontFamily
    });
    await addColumnContent(slide, spec.right, theme, 5.5, contentY, 4.5, true);
  }
}

// Helper functions for content addition with enhanced styling

/**
 * Add a modern visual separator with gradient effect
 */
function addSeparator(slide: pptxgen.Slide, theme: ProfessionalTheme, x: number, y: number, w: number) {
  // Main separator line
  slide.addShape('rect', {
    x, y, w, h: 0.03,
    fill: { color: theme.colors.primary.replace('#', ''), transparency: 20 },
    line: { width: 0 }
  });

  // Subtle accent line above
  slide.addShape('rect', {
    x: x + w * 0.1, y: y - 0.05, w: w * 0.8, h: 0.01,
    fill: { color: theme.colors.accent.replace('#', ''), transparency: 40 },
    line: { width: 0 }
  });
}



/**
 * Add a subtle background shape for content sections
 */
function addContentBackground(slide: pptxgen.Slide, theme: ProfessionalTheme, x: number, y: number, w: number, h: number) {
  slide.addShape('rect', {
    x: x - 0.1, y: y - 0.1, w: w + 0.2, h: h + 0.2,
    fill: { color: theme.colors.surface.replace('#', ''), transparency: 15 },
    line: { color: theme.colors.borders.light.replace('#', ''), width: 1 }

  });
}

/**
 * Add a modern professional icon with enhanced styling
 */


/**
 * Add a callout box for important information
 */
export function addCallout(slide: pptxgen.Slide, theme: ProfessionalTheme, text: string, x: number, y: number, w: number, type: 'info' | 'warning' | 'success' | 'error' = 'info') {
  const colorMap = {
    info: theme.colors.semantic.info,
    warning: theme.colors.semantic.warning,
    success: theme.colors.semantic.success,
    error: theme.colors.semantic.error
  };

  const bgColor = colorMap[type];

  // Add callout background
  slide.addShape('rect', {
    x: x - 0.05, y: y - 0.05, w: w + 0.1, h: 0.8,
    fill: { color: bgColor.replace('#', ''), transparency: 85 },
    line: { color: bgColor.replace('#', ''), width: 2 }
  });

  // Add callout text
  slide.addText(text, {
    x, y: y + 0.1, w, h: 0.6,
    fontSize: theme.typography.body.sizes.normal,
    color: theme.colors.text.primary.replace('#', ''),
    fontFace: theme.typography.body.fontFamily,
    align: 'left',
    valign: 'middle',
    bold: true
  });
}

/**
 * Add a progress bar visualization
 */
export function addProgressBar(slide: pptxgen.Slide, theme: ProfessionalTheme, percentage: number, label: string, x: number, y: number, w: number) {
  const barHeight = 0.3;

  // Background bar
  slide.addShape('rect', {
    x, y, w, h: barHeight,
    fill: { color: theme.colors.borders.light.replace('#', '') },
    line: { color: theme.colors.borders.medium.replace('#', ''), width: 1 }
  });

  // Progress fill
  slide.addShape('rect', {
    x, y, w: w * (percentage / 100), h: barHeight,
    fill: { color: theme.colors.primary.replace('#', '') },
    line: { color: theme.colors.primary.replace('#', ''), width: 1 }
  });

  // Label
  slide.addText(`${label}: ${percentage}%`, {
    x, y: y + barHeight + 0.1, w, h: 0.3,
    fontSize: theme.typography.body.sizes.small,
    color: theme.colors.text.secondary.replace('#', ''),
    fontFace: theme.typography.body.fontFamily,
    align: 'left'
  });
}

function addBullets(slide: pptxgen.Slide, bullets: string[], theme: ProfessionalTheme, x: number, y: number, w: number) {
  const bulletSpacing = Math.max(0.3, theme.spacing.lg / 72); // Convert to inches with minimum
  const bulletHeight = Math.max(0.4, theme.spacing.xl / 72); // Convert to inches with minimum

  bullets.forEach((bullet, i) => {
    slide.addText(bullet, {
      x, y: y + i * bulletSpacing, w, h: bulletHeight,
      fontSize: theme.typography.body.sizes.normal,
      bullet: {
        type: 'bullet',
        style: '•',
        indent: 0.25 // Use fixed indent in inches
      },
      color: theme.colors.text.primary.replace('#', ''),
      fontFace: theme.typography.body.fontFamily,
      lineSpacing: Math.max(100, Math.min(300, Math.round(theme.typography.body.lineHeight.normal * 100))),
      valign: 'top'
    });
  });
}

function addParagraph(slide: pptxgen.Slide, text: string, theme: ProfessionalTheme, x: number, y: number, w: number, isQuote = false) {
  slide.addText(text, {
    x, y, w, h: 2.0,
    fontSize: isQuote ? theme.typography.body.sizes.large : theme.typography.body.sizes.normal,
    color: isQuote ? theme.colors.text.secondary.replace('#', '') : theme.colors.text.primary.replace('#', ''),
    fontFace: theme.typography.body.fontFamily,
    lineSpacing: Math.max(100, Math.min(300, Math.round(theme.typography.body.lineHeight.normal * 100))),
    italic: isQuote,
    align: 'left',
    valign: 'top'
  });
}

async function addColumnContent(slide: pptxgen.Slide, content: { heading?: string; bullets?: string[]; paragraph?: string; imagePrompt?: string; metrics?: { label: string; value: string; unit?: string }[] }, theme: ProfessionalTheme, x: number, y: number, w: number, isRight = false) {
  let currentY = y;
  const sectionSpacing = theme.spacing.lg / 72; // Convert to inches
  const headingSpacing = theme.spacing.md / 72; // Convert to inches

  if (content.heading) {
    slide.addText(content.heading, {
      x, y: currentY, w, h: 0.7,
      fontSize: theme.typography.headings.sizes.h3,
      bold: true,
      color: theme.colors.secondary.replace('#', ''),
      fontFace: theme.typography.headings.fontFamily,
      lineSpacing: Math.max(100, Math.min(300, Math.round(theme.typography.headings.lineHeight.tight * 100)))
    });
    currentY += 0.8 + headingSpacing;
  }
  if (content.paragraph) {
    addParagraph(slide, content.paragraph, theme, x, currentY, w);
    currentY += 1.5 + sectionSpacing;
  }
  if (content.bullets) {
    addBullets(slide, content.bullets, theme, x, currentY, w);
    currentY += content.bullets.length * (theme.spacing.lg / 72) + sectionSpacing;
  }
  if (content.metrics) {
    addMetrics(slide, content.metrics, theme, x, currentY, w);
    currentY += Math.ceil(content.metrics.length / 2) * 1.2 + sectionSpacing;
  }
  if (content.imagePrompt && isRight) {
    await addImage(slide, content.imagePrompt, theme, x, y, w * 0.8, 3.0);
  }
}

function addMetrics(slide: pptxgen.Slide, metrics: { label: string; value: string; unit?: string }[], theme: ProfessionalTheme, x: number, y: number, w: number) {
  const metricsPerRow = 2;
  const metricWidth = w / metricsPerRow;
  const cardHeight = 1.0;

  metrics.forEach((metric, index) => {
    const row = Math.floor(index / metricsPerRow);
    const col = index % metricsPerRow;
    const metricX = x + (col * metricWidth);
    const metricY = y + (row * (cardHeight + 0.2));

    // Add metric card background with enhanced shadow effect
    slide.addShape('rect', {
      x: metricX + 0.1, y: metricY, w: metricWidth - 0.3, h: cardHeight,
      fill: { color: theme.colors.surface.replace('#', '') },
      line: { color: theme.colors.borders.light.replace('#', ''), width: 1 }

    });

    // Value with enhanced styling
    slide.addText(metric.value + (metric.unit || ''), {
      x: metricX + 0.1, y: metricY + 0.1, w: metricWidth - 0.3, h: 0.5,
      fontSize: theme.typography.headings.sizes.h1,
      bold: true,
      color: theme.colors.primary.replace('#', ''),
      align: 'center',
      fontFace: theme.typography.headings.fontFamily,
      lineSpacing: Math.max(100, Math.min(300, Math.round(theme.typography.headings.lineHeight.tight * 100)))
    });

    // Label with improved spacing
    slide.addText(metric.label, {
      x: metricX + 0.1, y: metricY + 0.6, w: metricWidth - 0.3, h: 0.3,
      fontSize: theme.typography.body.sizes.small,
      color: theme.colors.text.secondary.replace('#', ''),
      align: 'center',
      fontFace: theme.typography.body.fontFamily,
      lineSpacing: Math.max(100, Math.min(300, Math.round(theme.typography.body.lineHeight.normal * 100)))
    });
  });
}

function addChart(slide: pptxgen.Slide, chart: SlideSpec['chart'], theme: ProfessionalTheme, x: number, y: number, w: number, h: number) {
  if (!chart) return;

  // Prepare chart data with enhanced modern color palette
  const modernChartColors = [
    theme.colors.primary.replace('#', ''),
    theme.colors.secondary.replace('#', ''),
    theme.colors.accent.replace('#', ''),
    '6366F1', // Modern indigo
    '10B981', // Modern emerald
    'F59E0B', // Modern amber
    'EF4444', // Modern red
    '8B5CF6', // Modern violet
    '06B6D4', // Modern cyan
    'F97316'  // Modern orange
  ];

  const chartData = chart.series.map((s, index) => ({
    name: s.name,
    labels: chart.categories,
    values: s.data,
    color: s.color || modernChartColors[index % modernChartColors.length]
  }));

  // Map chart types to pptxgenjs format
  const chartTypeMap: Record<string, string> = {
    'bar': 'bar',
    'column': 'column',
    'line': 'line',
    'pie': 'pie',
    'doughnut': 'doughnut',
    'area': 'area',
    'scatter': 'scatter'
  };

  const pptxChartType = chartTypeMap[chart.type] || 'bar';

  // Simplified chart background
  slide.addShape('rect', {
    x: x - 0.1, y: y - 0.1, w: w + 0.2, h: h + 0.2,
    fill: { color: theme.colors.surface.replace('#', ''), transparency: 10 },
    line: { color: theme.colors.borders.medium.replace('#', ''), width: 1 }
  });

  // Simplified chart options
  slide.addChart(pptxChartType as any, chartData, {
    x, y, w, h,
    title: chart.title,
    titleColor: theme.colors.text.primary.replace('#', ''),
    titleFontSize: theme.typography.headings.sizes.h3,
    showLegend: chart.showLegend,
    legendPos: 'b',
    showDataTable: chart.showDataLabels,
    chartColors: chartData.map(d => d.color)
  });

  // Add subtitle if present
  if (chart.subtitle) {
    slide.addText(chart.subtitle, {
      x, y: y + h + 0.1, w, h: 0.3,
      fontSize: theme.typography.body.sizes.small,
      color: theme.colors.text.secondary.replace('#', ''),
      align: 'center',
      fontFace: theme.typography.body.fontFamily
    });
  }
}

async function addImage(slide: pptxgen.Slide, imagePrompt: string, theme: ProfessionalTheme, x: number, y: number, w: number, h: number) {
  try {
    // Simplified image frame without complex properties
    slide.addShape('rect', {
      x: x - 0.05, y: y - 0.05, w: w + 0.1, h: h + 0.1,
      fill: { color: theme.colors.surface.replace('#', '') },
      line: { color: theme.colors.borders.medium.replace('#', ''), width: 1 }
    });

    const response = await getOpenAI().images.generate({
      prompt: `${imagePrompt}, professional style, clean background, high quality`,
      model: 'dall-e-3',
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json'
    });
    const imageData = response.data?.[0]?.b64_json;
    if (!imageData) throw new Error('No image generated');

    // Simplified image addition without complex sizing options
    slide.addImage({
      data: `data:image/png;base64,${imageData}`,
      x, y, w, h
    });
  } catch (error) {
    console.error('Image generation failed:', error);
    // Simplified fallback placeholder
    slide.addShape('rect', {
      x, y, w, h,
      fill: { color: theme.colors.surface.replace('#', ''), transparency: 30 },
      line: { color: theme.colors.borders.medium.replace('#', ''), width: 1 }
    });

    slide.addText('Image Placeholder', {
      x, y: y + h/2 - 0.2, w, h: 0.4,
      align: 'center',
      valign: 'middle',
      color: theme.colors.text.muted.replace('#', ''),
      fontSize: theme.typography.body.sizes.small,
      fontFace: theme.typography.body.fontFamily
    });
  }
}

/**
 * Generate a comprehensive sample presentation to showcase all styling improvements
 * This function creates a demo of enhanced typography, colors, effects, and layouts
 */
export async function generateStyleShowcase(): Promise<Buffer> {
  const sampleSlides: SlideSpec[] = [
    {
      title: 'Modern Professional PowerPoint Design',
      layout: 'title',
      paragraph: 'Showcasing enhanced typography, contemporary colors, improved visual effects, and professional layouts with accessibility compliance',
      design: { theme: 'modern-slate' },
      notes: 'This presentation demonstrates the comprehensive styling improvements including modern font stacks, enhanced visual effects, and professional design patterns.'
    },
    {
      title: 'Enhanced Typography System',
      layout: 'title-bullets',
      bullets: [
        'Modern system font stacks with cross-platform compatibility',
        'Improved font hierarchy with proper sizing and spacing',
        'Enhanced readability with optimized line heights',
        'Professional font combinations for headings and body text',
        'Accessibility-compliant contrast ratios'
      ],
      design: { theme: 'corporate-blue' },
      notes: 'Typography improvements focus on readability, accessibility, and modern design principles.'
    },
    {
      title: 'Contemporary Color Palettes',
      layout: 'two-column',
      left: {
        heading: 'New Modern Themes',
        bullets: [
          'Modern Minimalist (Slate)',
          'Creative Energy (Coral)',
          'Natural Professional (Forest)',
          'Tech Innovation (Electric Blue)',
          'Creative Warmth (Sunset)'
        ]
      },
      right: {
        heading: 'Enhanced Features',
        bullets: [
          'Improved color accessibility',
          'Better contrast ratios',
          'Contemporary color combinations',
          'Professional appearance',
          'Cross-platform compatibility'
        ]
      },
      design: { theme: 'vibrant-coral' }
    },
    {
      title: 'Two-Column Layout with Visual Enhancements',
      layout: 'two-column',
      left: {
        heading: 'Key Features',
        bullets: [
          'Visual separators between columns',
          'Subtle background cards',
          'Enhanced spacing system',
          'Professional shadows and effects'
        ]
      },
      right: {
        heading: 'Benefits',
        bullets: [
          'Improved readability',
          'Modern appearance',
          'Better visual hierarchy',
          'Professional presentation'
        ]
      },
      design: { theme: 'corporate-blue' }
    },
    {
      title: 'Enhanced Visual Effects & Graphics',
      layout: 'title-bullets',
      bullets: [
        'Modern shadow effects with improved depth and realism',
        'Enhanced border radius for contemporary appearance',
        'Professional gradient backgrounds and accents',
        'Improved card designs with elevated shadows',
        'Better visual hierarchy through enhanced spacing'
      ],
      design: { theme: 'deep-forest' }
    },
    {
      title: 'Professional Metrics Display',
      layout: 'mixed-content',
      paragraph: 'Metrics are displayed in modern cards with enhanced shadows, improved typography, and professional styling that ensures readability and visual impact.',
      left: {
        metrics: [
          { label: 'Design Quality Score', value: '95', unit: '/100' },
          { label: 'Accessibility Rating', value: 'AA', unit: '' },
          { label: 'Typography Score', value: '92', unit: '/100' },
          { label: 'Color Harmony', value: 'A+', unit: '' }
        ]
      },
      design: { theme: 'electric-blue' },
      notes: 'Enhanced metrics cards feature improved shadows, better spacing, and professional typography for maximum visual impact.'
    },
    {
      title: 'Style Validation & Quality Assurance',
      layout: 'title-bullets',
      bullets: [
        'Automated style validation ensures professional standards',
        'Accessibility compliance with WCAG guidelines',
        'Typography quality assessment and optimization',
        'Color harmony validation for professional appearance',
        'Layout optimization for better content organization'
      ],
      design: { theme: 'warm-sunset' },
      notes: 'The new style validation system ensures every generated presentation meets professional design standards and accessibility requirements.'
    }
  ];

  return await generatePpt(sampleSlides, true);
}

/**
 * Generate a presentation with all new themes for comparison
 */
export async function generateThemeShowcase(): Promise<Buffer> {
  const themeSlides: SlideSpec[] = [
    {
      title: 'Modern Minimalist Theme',
      layout: 'title-paragraph',
      paragraph: 'Clean, contemporary design with sophisticated typography and professional color palette.',
      design: { theme: 'modern-slate' }
    },
    {
      title: 'Creative Energy Theme',
      layout: 'title-paragraph',
      paragraph: 'Vibrant and engaging design perfect for creative presentations and innovative content.',
      design: { theme: 'vibrant-coral' }
    },
    {
      title: 'Natural Professional Theme',
      layout: 'title-paragraph',
      paragraph: 'Calming green palette with professional styling ideal for healthcare and wellness presentations.',
      design: { theme: 'deep-forest' }
    },
    {
      title: 'Tech Innovation Theme',
      layout: 'title-paragraph',
      paragraph: 'Modern blue gradient design optimized for technology and innovation presentations.',
      design: { theme: 'electric-blue' }
    },
    {
      title: 'Creative Warmth Theme',
      layout: 'title-paragraph',
      paragraph: 'Warm, inviting color palette with creative flair for engaging presentations.',
      design: { theme: 'warm-sunset' }
    }
  ];

  return await generatePpt(themeSlides, true);
}