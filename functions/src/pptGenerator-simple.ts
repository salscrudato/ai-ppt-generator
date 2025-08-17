/**
 * Simplified PowerPoint Generator (Best‑in‑Class, Safe Layout)
 *
 * Streamlined generator focused on core functionality with:
 * - Safer layout math for 16:9 (10" x 5.63") slides
 * - Robust color/font fallbacks
 * - Theme-aware defaults
 * - Diagnostics + corruption checks
 * - Modern, tasteful visual accents that respect slide bounds
 *
 * Optimized for AI agent development and production reliability.
 */

import pptxgen from 'pptxgenjs';
import { SlideSpec } from './schema';
import { ProfessionalTheme, getThemeById, selectThemeForContent } from './professionalThemes';
import { logger, type LogContext } from './utils/smartLogger';
import { corruptionDiagnostics } from './utils/corruptionDiagnostics';

/* -------------------------------------------------------------------------------------------------
 * Constants & Layout Helpers
 * ------------------------------------------------------------------------------------------------- */

// Default widescreen slide size used by pptxgenjs (inches)
const SLIDE = { width: 10, height: 5.63 };

/**
 * Compute a modern layout with safe, consistent spacing that fits 16:9 slides.
 * All positions/heights are in inches.
 */
const MODERN_LAYOUT = (() => {
  const margins = { top: 0.6, bottom: 0.4, left: 0.8, right: 0.8 };
  const contentWidth = SLIDE.width - margins.left - margins.right;

  const typography = {
    title: { fontSize: 34, lineSpacing: 40, fontWeight: 'bold' as const },
    subtitle: { fontSize: 24, lineSpacing: 30, fontWeight: 'normal' as const },
    body: { fontSize: 20, lineSpacing: 28, fontWeight: 'normal' as const },
    bullets: { fontSize: 19, lineSpacing: 30, fontWeight: 'normal' as const },
  };

  const spacing = {
    titleToContent: 0.3,
    paragraphSpacing: 0.22,
    bulletSpacing: 0.30,
    columnGap: 0.6,
  };

  const titleHeight = 0.9;
  const subtitleHeight = 0.6;

  const bodyStartY = margins.top + titleHeight + spacing.titleToContent;
  const bodyHeight = SLIDE.height - margins.top - margins.bottom - titleHeight - spacing.titleToContent;

  return {
    margins,
    content: {
      width: contentWidth,
      titleHeight,
      subtitleHeight,
      bodyStartY,
      bodyHeight,
    },
    spacing,
    typography,
    elements: {
      headerBarHeight: 0.12,
      footerBarHeight: 0.06,
      containerPad: 0.12,
    },
  };
})();

/* -------------------------------------------------------------------------------------------------
 * Utilities (colors, fonts, text)
 * ------------------------------------------------------------------------------------------------- */

type ColorLike = string | { primary?: string } | undefined | null;

// Map a variety of inputs into a 6‑digit hex (without '#'), with safe fallbacks.
function safeColor(input: ColorLike, fallback = '333333'): string {
  const NAMED: Record<string, string> = {
    white: 'FFFFFF', black: '000000', red: 'FF0000', green: '00AA00', blue: '0000FF',
    gray: '808080', grey: '808080', orange: 'F97316', yellow: 'F59E0B', teal: '0D9488',
  };

  let color = typeof input === 'string' ? input : (input && typeof input === 'object' && input.primary) ? input.primary : '';
  color = (color || '').trim();

  if (!color) return fallback;

  // Named color?
  const lower = color.toLowerCase().replace('#', '');
  if (NAMED[lower]) return NAMED[lower];

  // Strip leading '#'
  color = color.replace('#', '');

  // Expand 3‑digit hex (#abc -> aabbcc)
  if (/^[0-9a-fA-F]{3}$/.test(color)) {
    const [r, g, b] = color.split('');
    return `${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  // 6‑8 digit hex; use first 6 for pptx color
  if (/^[0-9a-fA-F]{6,8}$/.test(color)) return color.substring(0, 6).toUpperCase();

  return fallback;
}

function getTextColor(theme: ProfessionalTheme): string {
  const primary = (theme.colors as any)?.text?.primary ?? '333333';
  return safeColor(primary);
}

function getPowerPointFont(fontFamily: string | undefined): string {
  const fontMap: Record<string, string> = {
    Inter: 'Calibri',
    'SF Pro Display': 'Calibri',
    'SF Pro Text': 'Calibri',
    'system-ui': 'Calibri',
    '-apple-system': 'Calibri',
    BlinkMacSystemFont: 'Calibri',
    'Segoe UI': 'Segoe UI',
    Roboto: 'Calibri',
    'Helvetica Neue': 'Helvetica',
    Arial: 'Arial',
    'Times New Roman': 'Times New Roman',
    Charter: 'Times New Roman',
    Cambria: 'Cambria',
    'Work Sans': 'Calibri',
    'IBM Plex Sans': 'Calibri',
    'DM Sans': 'Calibri',
  };

  const first = (fontFamily ?? 'Calibri').split(',')[0].trim().replace(/['"]/g, '');
  return fontMap[first] || 'Calibri';
}

function headingFont(theme: ProfessionalTheme): string {
  return getPowerPointFont(theme?.typography?.headings?.fontFamily);
}
function bodyFont(theme: ProfessionalTheme): string {
  return getPowerPointFont(theme?.typography?.body?.fontFamily);
}

// Use built-in bullets for semantic lists; join as newline-separated items
function formatBulletsForPptx(bullets: string[]): string {
  return bullets.map(b => (b ?? '').trim()).filter(Boolean).join('\n');
}

/* -------------------------------------------------------------------------------------------------
 * Background & Decorative Elements (bounded for 16:9)
 * ------------------------------------------------------------------------------------------------- */

function getModernBackground(theme: ProfessionalTheme, slideIndex = 0): { color: string; transparency?: number } {
  const colors = theme.colors;
  const variations = [
    { color: colors.background === '#FFFFFF' ? 'FAFBFC' : safeColor(colors.background, 'FFFFFF'), transparency: 0 },
    { color: safeColor(colors.surface, 'FFFFFF'), transparency: 10 },
    { color: safeColor(colors.primary), transparency: 96 },
  ];
  return variations[slideIndex % variations.length];
}

function addModernDesignElements(pres: pptxgen, slide: any, theme: ProfessionalTheme, slideIndex = 0, layout: string = 'default'): void {
  const { margins, content, elements } = MODERN_LAYOUT;
  const accent = safeColor(theme.colors.accent);
  const primary = safeColor(theme.colors.primary);
  const surface = safeColor(theme.colors.surface, 'F5F6F7');

  // Header bar
  slide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: SLIDE.width,
    h: elements.headerBarHeight,
    fill: { color: accent },
    line: { width: 0 },
  });
  // Soft shadow under header
  slide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: elements.headerBarHeight,
    w: SLIDE.width,
    h: 0.04,
    fill: { color: accent, transparency: 85 },
    line: { width: 0 },
  });

  // Content container hairline (very light)
  slide.addShape(pres.ShapeType.rect, {
    x: margins.left - 0.1,
    y: margins.top - 0.1,
    w: content.width + 0.2,
    h: SLIDE.height - margins.top - margins.bottom + 0.2,
    fill: { color: 'FFFFFF', transparency: 100 },
    line: { color: surface, width: 1, transparency: 70 },
  });

  // Layout-specific embellishments
  switch (layout) {
    case 'title':
      addTitleSlideDesign(pres, slide, theme);
      break;
    case 'title-bullets':
      addBulletSlideDesign(pres, slide, theme);
      break;
    case 'two-column':
      addTwoColumnDesign(pres, slide, theme);
      break;
    case 'mixed-content':
      addMixedContentDesign(pres, slide, theme);
      break;
  }

  // Corner motif (bottom-right) on odd slides
  if (slideIndex % 2 === 1) {
    slide.addShape(pres.ShapeType.ellipse, {
      x: SLIDE.width - 0.9,
      y: SLIDE.height - 0.9,
      w: 0.5,
      h: 0.5,
      fill: { color: accent, transparency: 78 },
      line: { width: 0 },
    });
    slide.addShape(pres.ShapeType.ellipse, {
      x: SLIDE.width - 0.76,
      y: SLIDE.height - 0.76,
      w: 0.24,
      h: 0.24,
      fill: { color: primary, transparency: 60 },
      line: { width: 0 },
    });
  }

  // Footer accent on every 3rd slide
  if (slideIndex % 3 === 2) {
    const y = SLIDE.height - 0.35;
    slide.addShape(pres.ShapeType.rect, {
      x: margins.left,
      y,
      w: content.width,
      h: elements.footerBarHeight,
      fill: { color: safeColor(theme.colors.secondary), transparency: 70 },
      line: { width: 0 },
    });
    slide.addShape(pres.ShapeType.rect, {
      x: margins.left,
      y,
      w: 1.8,
      h: elements.footerBarHeight,
      fill: { color: accent, transparency: 45 },
      line: { width: 0 },
    });
  }
}

function addTitleSlideDesign(pres: pptxgen, slide: any, theme: ProfessionalTheme): void {
  const primary = safeColor(theme.colors.primary);
  const accent = safeColor(theme.colors.accent);

  // Underline motif near lower third
  slide.addShape(pres.ShapeType.rect, {
    x: 2.0,
    y: 4.3,
    w: 6.0,
    h: 0.06,
    fill: { color: primary, transparency: 45 },
    line: { width: 0 },
  });
  slide.addShape(pres.ShapeType.rect, {
    x: 2.0,
    y: 4.3,
    w: 1.4,
    h: 0.06,
    fill: { color: accent },
    line: { width: 0 },
  });

  // Light side dots
  slide.addShape(pres.ShapeType.ellipse, {
    x: 1.2,
    y: 4.15,
    w: 0.34,
    h: 0.34,
    fill: { color: accent, transparency: 80 },
    line: { width: 0 },
  });
  slide.addShape(pres.ShapeType.ellipse, {
    x: 8.46,
    y: 4.15,
    w: 0.34,
    h: 0.34,
    fill: { color: primary, transparency: 80 },
    line: { width: 0 },
  });
}

function addBulletSlideDesign(pres: pptxgen, slide: any, theme: ProfessionalTheme): void {
  const { margins, content } = MODERN_LAYOUT;
  const accent = safeColor(theme.colors.accent);
  const primary = safeColor(theme.colors.primary);
  const surface = safeColor(theme.colors.surface, 'F3F4F6');

  slide.addShape(pres.ShapeType.rect, {
    x: margins.left - 0.24,
    y: content.bodyStartY - 0.08,
    w: 0.14,
    h: content.bodyHeight + 0.16,
    fill: { color: accent },
    line: { width: 0 },
  });
  slide.addShape(pres.ShapeType.rect, {
    x: margins.left - 0.1,
    y: content.bodyStartY - 0.08,
    w: 0.04,
    h: content.bodyHeight + 0.16,
    fill: { color: primary, transparency: 68 },
    line: { width: 0 },
  });
  slide.addShape(pres.ShapeType.rect, {
    x: margins.left + 0.08,
    y: content.bodyStartY - 0.06,
    w: content.width - 0.28,
    h: content.bodyHeight + 0.12,
    fill: { color: 'FFFFFF', transparency: 100 },
    line: { color: surface, width: 0.5, transparency: 90 },
  });
}

function addTwoColumnDesign(pres: pptxgen, slide: any, theme: ProfessionalTheme): void {
  const { content, margins } = MODERN_LAYOUT;
  const accent = safeColor(theme.colors.accent);
  const primary = safeColor(theme.colors.primary);

  // Column divider
  slide.addShape(pres.ShapeType.rect, {
    x: margins.left + content.width / 2 - 0.05,
    y: content.bodyStartY - 0.08,
    w: 0.1,
    h: content.bodyHeight + 0.16,
    fill: { color: accent, transparency: 62 },
    line: { width: 0 },
  });

  // End caps
  slide.addShape(pres.ShapeType.ellipse, {
    x: margins.left + content.width / 2 - 0.1,
    y: content.bodyStartY - 0.18,
    w: 0.2,
    h: 0.2,
    fill: { color: accent, transparency: 44 },
    line: { width: 0 },
  });
  slide.addShape(pres.ShapeType.ellipse, {
    x: margins.left + content.width / 2 - 0.1,
    y: content.bodyStartY + content.bodyHeight - 0.02,
    w: 0.2,
    h: 0.2,
    fill: { color: primary, transparency: 44 },
    line: { width: 0 },
  });
}

function addMixedContentDesign(pres: pptxgen, slide: any, theme: ProfessionalTheme): void {
  const { content, margins } = MODERN_LAYOUT;
  const surface = safeColor(theme.colors.surface, 'EEF1F5');
  const primary = safeColor(theme.colors.primary);

  // Left card
  slide.addShape(pres.ShapeType.rect, {
    x: margins.left - 0.08,
    y: content.bodyStartY - 0.16,
    w: content.width / 2 - 0.1,
    h: content.bodyHeight + 0.32,
    fill: { color: 'FFFFFF' },
    line: { color: surface, width: 1, transparency: 70 },
  });
  slide.addShape(pres.ShapeType.rect, {
    x: margins.left - 0.08,
    y: content.bodyStartY - 0.16,
    w: content.width / 2 - 0.1,
    h: 0.28,
    fill: { color: surface, transparency: 80 },
    line: { width: 0 },
  });

  // Right card
  slide.addShape(pres.ShapeType.rect, {
    x: margins.left + content.width / 2 + 0.08,
    y: content.bodyStartY - 0.16,
    w: content.width / 2 - 0.1,
    h: content.bodyHeight + 0.32,
    fill: { color: 'FFFFFF' },
    line: { color: primary, width: 1, transparency: 70 },
  });
  slide.addShape(pres.ShapeType.rect, {
    x: margins.left + content.width / 2 + 0.08,
    y: content.bodyStartY - 0.16,
    w: content.width / 2 - 0.1,
    h: 0.28,
    fill: { color: primary, transparency: 80 },
    line: { width: 0 },
  });

  // Connector
  slide.addShape(pres.ShapeType.rect, {
    x: margins.left + content.width / 2 - 0.2,
    y: content.bodyStartY + 1.6,
    w: 0.4,
    h: 0.06,
    fill: { color: safeColor(theme.colors.accent), transparency: 58 },
    line: { width: 0 },
  });
}

/* -------------------------------------------------------------------------------------------------
 * Core Generation
 * ------------------------------------------------------------------------------------------------- */

/**
 * Simple PowerPoint generation function
 * @param specs - Array of slide specifications
 * @param validateStyles - Whether to perform basic validation (default: true)
 * @returns Promise<Buffer> - PowerPoint file buffer
 */
export async function generateSimplePpt(specs: SlideSpec[], validateStyles: boolean = true): Promise<Buffer> {
  const startTime = Date.now();
  const context: LogContext = {
    requestId: `ppt_simple_${Date.now()}`,
    component: 'pptGenerator-simple',
    operation: 'generateSimplePpt',
  };

  logger.info(`Starting PowerPoint generation for ${specs.length} slides`, context, { validateStyles });
  console.log('🎯 generateSimplePpt specs summary:', {
    count: specs.length,
    layouts: specs.map(s => s.layout),
  });

  // Diagnostics (pre)
  const presentationTitle = specs.length > 0 ? (specs[0].title || 'Untitled Presentation') : 'Untitled Presentation';
  const diagnosticReport = corruptionDiagnostics.generateReport(presentationTitle, specs, undefined, context);
  logger.info('Corruption diagnostics (pre) completed', context, {
    reportId: diagnosticReport.id,
    overallHealth: diagnosticReport.overallHealth,
    issueCount: diagnosticReport.issues.length,
    criticalIssues: diagnosticReport.issues.filter(i => i.severity === 'critical').length,
  });
  const criticalIssues = diagnosticReport.issues.filter(i => i.severity === 'critical');
  if (criticalIssues.length > 0) {
    const errorMessage = `Critical corruption issues detected: ${criticalIssues.map(i => i.title).join(', ')}`;
    logger.error(errorMessage, context, { diagnosticReport });
    throw new Error(errorMessage);
  }

  // Presentation instance
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'AI PowerPoint Generator';
  pres.company = 'Professional Presentations';
  pres.title = presentationTitle;

  // Theme selection + default fonts
  const theme: ProfessionalTheme =
    getThemeById('corporate-blue') ||
    selectThemeForContent({ presentationType: 'business', tone: 'professional' });

  pres.theme = {
    headFontFace: headingFont(theme),
    bodyFontFace: bodyFont(theme),
  };

  // Slides
  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    const slide = pres.addSlide();
    const slideStartTime = Date.now();

    logger.info(`Rendering slide ${i + 1}/${specs.length}`, context, {
      title: spec.title,
      layout: spec.layout,
    });

    try {
      await buildSimpleSlide(pres, slide, spec, theme, i);
      logger.info(`Slide ${i + 1} complete`, context, {
        processingTime: Date.now() - slideStartTime,
        layout: spec.layout,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Error building slide ${i + 1}`, context, { error: message, layout: spec.layout });
      slide.addText('Error generating slide content', {
        x: 1,
        y: 2,
        w: 8,
        h: 1,
        fontSize: 24,
        color: 'FF0000',
        bold: true,
        align: 'center',
      });
    }
  }

  // Emit Buffer
  let buffer: Buffer;
  try {
    const out = (await pres.write({ outputType: 'nodebuffer' })) as Buffer;
    buffer = out;

    // Basic integrity checks
    if (!buffer || buffer.length === 0) throw new Error('Generated buffer is empty');
    const signature = buffer.subarray(0, 4);
    const expected = Buffer.from([0x50, 0x4b, 0x03, 0x04]); // PK\x03\x04
    if (!signature.equals(expected)) {
      logger.error('Invalid PPTX ZIP signature', context, {
        actualSignature: Array.from(signature).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
      });
      throw new Error('Generated PowerPoint file has invalid ZIP signature');
    }
    if (buffer.length < 2000) {
      logger.error('PowerPoint file too small', context, { bytes: buffer.length });
      throw new Error(`Generated file too small (${buffer.length} bytes) – likely corrupted`);
    }

    logger.info('Buffer validation passed', context, { bytes: buffer.length });

    // Diagnostics (post)
    const bufferDiagnosticReport = corruptionDiagnostics.generateReport(
      presentationTitle,
      specs,
      buffer,
      { ...context, stage: 'post_generation' }
    );

    logger.info('Corruption diagnostics (post) completed', context, {
      reportId: bufferDiagnosticReport.id,
      overallHealth: bufferDiagnosticReport.overallHealth,
      totalIssues: bufferDiagnosticReport.issues.length,
    });

    const bufferCriticalIssues = bufferDiagnosticReport.issues.filter(i => i.severity === 'critical' && i.type === 'buffer');
    if (bufferCriticalIssues.length > 0) {
      const msg = `Critical buffer corruption detected: ${bufferCriticalIssues.map(i => i.title).join(', ')}`;
      logger.error(msg, context, { bytes: buffer.length });
      throw new Error(msg);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    logger.error('Buffer generation error', context, { error: message });
    throw e;
  }

  const generationTime = Date.now() - startTime;
  logger.info('PowerPoint generation complete', context, { slideCount: specs.length, generationTime, bytes: buffer.length });
  console.log(`✅ PPT generated in ${generationTime}ms • ${Math.round(buffer.length / 1024)}KB • ${specs.length} slides`);

  return buffer;
}

/* -------------------------------------------------------------------------------------------------
 * Slide Builders
 * ------------------------------------------------------------------------------------------------- */

async function buildSimpleSlide(
  pres: pptxgen,
  slide: any,
  spec: SlideSpec,
  theme: ProfessionalTheme,
  slideIndex = 0
): Promise<void> {
  const { content, margins, typography } = MODERN_LAYOUT;

  // Background
  const bg = getModernBackground(theme, slideIndex);
  slide.background = { color: bg.color, transparency: bg.transparency };

  // Embellishments
  addModernDesignElements(pres, slide, theme, slideIndex, spec.layout);

  const titleText = spec.title || 'Untitled';
  const titlePos = { x: margins.left, y: margins.top, w: content.width, h: content.titleHeight };

  const headFace = headingFont(theme);
  const bodyFace = bodyFont(theme);
  const titleColor = safeColor(theme.colors.primary);
  const textColor = getTextColor(theme);

  try {
    switch (spec.layout) {
      case 'title':
      case 'hero': {
        slide.addText(titleText, {
          x: titlePos.x,
          y: 1.3, // visually centered for hero
          w: titlePos.w,
          h: titlePos.h + 0.6,
          fontSize: typography.title.fontSize + 4,
          color: titleColor,
          bold: true,
          align: 'center',
          fontFace: headFace,
          lineSpacing: typography.title.lineSpacing,
          shadow: { type: 'outer', blur: 3, offset: 2, angle: 45, color: safeColor(theme.colors.surface, 'E5E7EB'), opacity: 0.3 },
          fit: 'shrink',
        });

        if (spec.paragraph) {
          slide.addText(spec.paragraph, {
            x: titlePos.x,
            y: 2.3,
            w: titlePos.w,
            h: 0.8,
            fontSize: typography.subtitle.fontSize,
            color: textColor,
            align: 'center',
            fontFace: bodyFace,
            lineSpacing: typography.subtitle.lineSpacing,
            fit: 'shrink',
          });
        }
        break;
      }

      case 'title-bullets':
      case 'title-paragraph': {
        // Title
        slide.addText(titleText, {
          x: titlePos.x,
          y: titlePos.y,
          w: titlePos.w,
          h: titlePos.h,
          fontSize: typography.title.fontSize,
          color: titleColor,
          bold: true,
          fontFace: headFace,
          lineSpacing: typography.title.lineSpacing,
          fit: 'shrink',
        });

        // Bullets or paragraph
        if (spec.bullets && spec.bullets.length > 0) {
          const txt = formatBulletsForPptx(spec.bullets);
          slide.addText(txt, {
            x: margins.left + 0.2,
            y: content.bodyStartY,
            w: content.width - 0.4,
            h: content.bodyHeight,
            fontSize: typography.bullets.fontSize,
            color: textColor,
            fontFace: bodyFace,
            lineSpacing: typography.bullets.lineSpacing,
            valign: 'top',
            bullet: true,
            fit: 'shrink',
          });
        } else if (spec.paragraph) {
          slide.addText(spec.paragraph, {
            x: margins.left,
            y: content.bodyStartY,
            w: content.width,
            h: content.bodyHeight,
            fontSize: typography.body.fontSize,
            color: textColor,
            fontFace: bodyFace,
            lineSpacing: typography.body.lineSpacing,
            valign: 'top',
            fit: 'shrink',
          });
        }
        break;
      }

      case 'two-column': {
        // Title
        slide.addText(titleText, {
          x: titlePos.x,
          y: titlePos.y,
          w: titlePos.w,
          h: titlePos.h,
          fontSize: 30,
          color: titleColor,
          bold: true,
          fontFace: headFace,
          lineSpacing: 34,
          fit: 'shrink',
        });

        // Split bullets across two columns
        if (spec.bullets && spec.bullets.length > 0) {
          const mid = Math.ceil(spec.bullets.length / 2);
          const left = spec.bullets.slice(0, mid);
          const right = spec.bullets.slice(mid);

          const colW = (content.width - MODERN_LAYOUT.spacing.columnGap) / 2 - 0.2;

          if (left.length) {
            slide.addText(formatBulletsForPptx(left), {
              x: margins.left + 0.2,
              y: content.bodyStartY,
              w: colW,
              h: content.bodyHeight,
              fontSize: 18,
              color: textColor,
              fontFace: bodyFace,
              lineSpacing: 26,
              valign: 'top',
              bullet: true,
              fit: 'shrink',
            });
          }

          if (right.length) {
            slide.addText(formatBulletsForPptx(right), {
              x: margins.left + (content.width + MODERN_LAYOUT.spacing.columnGap) / 2,
              y: content.bodyStartY,
              w: colW,
              h: content.bodyHeight,
              fontSize: 18,
              color: textColor,
              fontFace: bodyFace,
              lineSpacing: 26,
              valign: 'top',
              bullet: true,
              fit: 'shrink',
            });
          }
        }
        break;
      }

      case 'mixed-content': {
        // Title
        slide.addText(titleText, {
          x: titlePos.x,
          y: titlePos.y,
          w: titlePos.w,
          h: titlePos.h,
          fontSize: 30,
          color: titleColor,
          bold: true,
          fontFace: headFace,
          lineSpacing: 34,
          fit: 'shrink',
        });

        // Left/right (fallback to paragraph + bullets)
        const anySpec: any = spec;

        if (anySpec.left || anySpec.right) {
          // Left
          if (anySpec.left) {
            const left = anySpec.left;
            const x = MODERN_LAYOUT.margins.left + 0.2;
            const w = (MODERN_LAYOUT.content.width - MODERN_LAYOUT.spacing.columnGap) / 2 - 0.2;
            let y = MODERN_LAYOUT.content.bodyStartY;

            if (left.content) {
              slide.addText(String(left.content), {
                x, y, w, h: 1.0,
                fontSize: 18,
                color: textColor,
                fontFace: bodyFont(theme),
                lineSpacing: 24,
                valign: 'top',
                fit: 'shrink',
              });
              y += 1.2;
            }
            if (left.bullets?.length) {
              slide.addText(formatBulletsForPptx(left.bullets), {
                x, y, w, h: MODERN_LAYOUT.content.bodyHeight - (y - MODERN_LAYOUT.content.bodyStartY),
                fontSize: 16,
                color: textColor,
                fontFace: bodyFont(theme),
                lineSpacing: 24,
                valign: 'top',
                bullet: true,
                fit: 'shrink',
              });
            }
          }

          // Right
          if (anySpec.right) {
            const right = anySpec.right;
            const w = (MODERN_LAYOUT.content.width - MODERN_LAYOUT.spacing.columnGap) / 2 - 0.2;
            const x = MODERN_LAYOUT.margins.left + (MODERN_LAYOUT.content.width + MODERN_LAYOUT.spacing.columnGap) / 2;
            let y = MODERN_LAYOUT.content.bodyStartY;

            if (right.content) {
              slide.addText(String(right.content), {
                x, y, w, h: 1.0,
                fontSize: 18,
                color: textColor,
                fontFace: bodyFont(theme),
                lineSpacing: 24,
                valign: 'top',
                fit: 'shrink',
              });
              y += 1.2;
            }
            if (right.bullets?.length) {
              slide.addText(formatBulletsForPptx(right.bullets), {
                x, y, w, h: MODERN_LAYOUT.content.bodyHeight - (y - MODERN_LAYOUT.content.bodyStartY),
                fontSize: 16,
                color: textColor,
                fontFace: bodyFont(theme),
                lineSpacing: 24,
                valign: 'top',
                bullet: true,
                fit: 'shrink',
              });
            }
          }
        } else {
          // Fallback paragraph + bullets
          if (spec.paragraph) {
            slide.addText(spec.paragraph, {
              x: MODERN_LAYOUT.margins.left,
              y: MODERN_LAYOUT.content.bodyStartY,
              w: MODERN_LAYOUT.content.width,
              h: 1.6,
              fontSize: 18,
              color: textColor,
              fontFace: bodyFace,
              lineSpacing: 26,
              valign: 'top',
              fit: 'shrink',
            });
          }
          if (spec.bullets?.length) {
            slide.addText(formatBulletsForPptx(spec.bullets), {
              x: MODERN_LAYOUT.margins.left + 0.2,
              y: spec.paragraph ? MODERN_LAYOUT.content.bodyStartY + 1.8 : MODERN_LAYOUT.content.bodyStartY,
              w: MODERN_LAYOUT.content.width - 0.4,
              h: spec.paragraph ? MODERN_LAYOUT.content.bodyHeight - 1.8 : MODERN_LAYOUT.content.bodyHeight,
              fontSize: 18,
              color: textColor,
              fontFace: bodyFace,
              lineSpacing: 28,
              valign: 'top',
              bullet: true,
              fit: 'shrink',
            });
          }
        }
        break;
      }

      case 'chart': {
        // Treat as metrics/tiles for the simple generator
        slide.addText(titleText, {
          x: 0.5,
          y: 0.5,
          w: SLIDE.width - 1.0,
          h: 0.8,
          fontSize: 28,
          color: titleColor,
          bold: true,
          fontFace: headFace,
          align: 'center',
          fit: 'shrink',
        });

        if (spec.bullets?.length) {
          const items = spec.bullets.slice(0, 6);
          const perRow = Math.min(3, items.length);
          const tileW = (SLIDE.width - 1.0) / perRow;

          items.forEach((metric, idx) => {
            const row = Math.floor(idx / perRow);
            const col = idx % perRow;

            slide.addText(String(metric), {
              x: 0.5 + col * tileW,
              y: 2.0 + row * 1.4,
              w: tileW - 0.2,
              h: 1.0,
              fontSize: 20,
              color: safeColor(theme.colors.accent),
              bold: true,
              align: 'center',
              fontFace: headFace,
              fit: 'shrink',
            });
          });
        }
        break;
      }

      case 'quote': {
        const quoteText = spec.paragraph || spec.bullets?.[0] || 'Quote text';
        slide.addText(`"${quoteText}"`, {
          x: 0.9,
          y: 2.0,
          w: SLIDE.width - 1.8,
          h: 1.6,
          fontSize: 24,
          color: titleColor,
          italic: true,
          align: 'center',
          fontFace: bodyFace,
          fit: 'shrink',
        });

        if (spec.title) {
          slide.addText(`— ${spec.title}`, {
            x: 1.2,
            y: 3.8,
            w: SLIDE.width - 2.4,
            h: 0.5,
            fontSize: 16,
            color: textColor,
            align: 'center',
            fontFace: bodyFace,
          });
        }
        break;
      }

      default: {
        // Fallback to bullet slide
        slide.addText(titleText, {
          x: titlePos.x,
          y: titlePos.y,
          w: titlePos.w,
          h: titlePos.h,
          fontSize: MODERN_LAYOUT.typography.title.fontSize,
          color: titleColor,
          bold: true,
          fontFace: headFace,
          lineSpacing: MODERN_LAYOUT.typography.title.lineSpacing,
          fit: 'shrink',
        });

        if (spec.bullets?.length) {
          slide.addText(formatBulletsForPptx(spec.bullets), {
            x: MODERN_LAYOUT.margins.left + 0.2,
            y: MODERN_LAYOUT.content.bodyStartY,
            w: MODERN_LAYOUT.content.width - 0.4,
            h: MODERN_LAYOUT.content.bodyHeight,
            fontSize: MODERN_LAYOUT.typography.bullets.fontSize,
            color: getTextColor(theme),
            fontFace: bodyFace,
            lineSpacing: MODERN_LAYOUT.typography.bullets.lineSpacing,
            valign: 'top',
            bullet: true,
            fit: 'shrink',
          });
        } else if (spec.paragraph) {
          slide.addText(spec.paragraph, {
            x: MODERN_LAYOUT.margins.left,
            y: MODERN_LAYOUT.content.bodyStartY,
            w: MODERN_LAYOUT.content.width,
            h: MODERN_LAYOUT.content.bodyHeight,
            fontSize: MODERN_LAYOUT.typography.body.fontSize,
            color: getTextColor(theme),
            fontFace: bodyFace,
            lineSpacing: MODERN_LAYOUT.typography.body.lineSpacing,
            valign: 'top',
            fit: 'shrink',
          });
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

/* -------------------------------------------------------------------------------------------------
 * Export alias for compatibility
 * ------------------------------------------------------------------------------------------------- */

export { generateSimplePpt as generatePpt };