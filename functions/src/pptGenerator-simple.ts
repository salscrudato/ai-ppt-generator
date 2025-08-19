/**
 * Professional PowerPoint Generator — v7.1.0 (robust)
 * - API-safe bullets, spacing, charts, and tables
 * - Uses Slide Masters for consistent backgrounds/branding
 * - Clean theme setup and metadata
 * - Defensive coding to avoid "Needs Repair" XML
 */

import pptxgen from 'pptxgenjs';
import { SlideSpec } from './schema';
import { ProfessionalTheme, PROFESSIONAL_THEMES } from './professionalThemes';
import { logger, LogContext } from './utils/smartLogger';

/* -------------------------------------------------------------------------------------------------
 * Constants (16:9) and Layout Metrics
 * ------------------------------------------------------------------------------------------------- */
const SLIDE = { width: 10, height: 5.625 }; // exact 16:9
const LAYOUT = {
  margins: { top: 0.6, right: 0.7, bottom: 0.5, left: 0.7 },
  type: {
    title:   { fontSize: 36 },
    body:    { fontSize: 18 },
    bullet:  { fontSize: 16 },
    caption: { fontSize: 12 },
  },
  spacing: {
    titleToContent: 0.35,
    colGap: 0.5,
  }
};
const CONTENT = {
  x: LAYOUT.margins.left,
  y: LAYOUT.margins.top,
  width: SLIDE.width - LAYOUT.margins.left - LAYOUT.margins.right,
  height: SLIDE.height - LAYOUT.margins.top - LAYOUT.margins.bottom,
  titleH: 0.8,
};
const colWidth = (CONTENT.width - LAYOUT.spacing.colGap) / 2;

/* -------------------------------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------------------------------- */
function safeColor(input: any, fallback = '333333'): string {
  if (!input) return fallback;
  const s = typeof input === 'string' ? input : (input?.primary ?? '');
  const hex = s.replace('#', '').trim();
  if (/^[0-9a-fA-F]{6}$/.test(hex)) return hex.toUpperCase();
  if (/^[0-9a-fA-F]{3}$/.test(hex)) return hex.split('').map((c: string) => c + c).join('').toUpperCase();
  return fallback;
}
function getThemeColors(theme: ProfessionalTheme) {
  const isCharcoal = theme.id === 'consulting-charcoal';
  return {
    primary: safeColor(theme.colors.primary, '1E40AF'),
    secondary: safeColor(theme.colors.secondary, '3B82F6'),
    accent: safeColor(theme.colors.accent, 'F59E0B'),
    background: safeColor(theme.colors.background, 'FFFFFF'),
    surface: safeColor(theme.colors.surface, 'F8FAFC'),
    textPrimary: isCharcoal ? safeColor(theme.colors.text.primary, '111827') : safeColor(theme.colors.text.primary, '1F2937'),
    textSecondary: isCharcoal ? safeColor(theme.colors.text.secondary, '374151') : safeColor(theme.colors.text.secondary, '6B7280'),
    textMuted: safeColor(theme.colors.text.muted, '9CA3AF'),
    borderLight: safeColor(theme.colors.borders?.light, 'F3F4F6'),
    borderMedium: safeColor(theme.colors.borders?.medium, 'E5E7EB'),
  };
}
function mapFont(fontFamily?: string): string {
  const map: Record<string, string> = {
    Inter: 'Calibri', 'SF Pro Display': 'Calibri', 'system-ui': 'Calibri',
    'Segoe UI': 'Segoe UI', Arial: 'Arial', Helvetica: 'Arial',
    Roboto: 'Calibri', 'Open Sans': 'Calibri', Lato: 'Calibri',
    'Times New Roman': 'Times New Roman', Georgia: 'Georgia',
  };
  if (!fontFamily) return 'Calibri';
  const first = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
  return map[first] ?? 'Calibri';
}
function getFonts(theme: ProfessionalTheme) {
  return {
    heading: mapFont(theme.typography.headings.fontFamily),
    body: mapFont(theme.typography.body.fontFamily),
  };
}
function sanitizeText(s?: string, max = 1000): string {
  if (!s) return '';
  let t = s
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\u2028\u2029]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[–—]/g, '-')
    .replace(/[…]/g, '...')
    .trim();
  if (!t) return '';
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 3);
  const i = cut.lastIndexOf(' ');
  return (i > max * 0.7 ? cut.slice(0, i) : cut) + '...';
}
function sanitizeBullets(items?: string[], maxItems = 6, maxEach = 180): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((b) => sanitizeText(b, maxEach))
    .filter((b) => !!b)
    .slice(0, maxItems);
}

/* -------------------------------------------------------------------------------------------------
 * Slide Masters (branding + background)
 * ------------------------------------------------------------------------------------------------- */
function defineMasters(pres: pptxgen, theme: ProfessionalTheme) {
  const colors = getThemeColors(theme);
  const marginTRBL = [LAYOUT.margins.top, LAYOUT.margins.right, LAYOUT.margins.bottom, LAYOUT.margins.left];

  pres.defineSlideMaster({
    title: 'PRO_CONTENT',
    background: { color: colors.background },
    margin: marginTRBL as any,
    objects: [
      // Top accent bar
      { rect: { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: colors.accent } } },
      // Subtle divider under bar
      { rect: { x: 0, y: 0.1, w: '100%', h: 0.02, fill: { color: colors.borderLight } } },
    ],
  });

  pres.defineSlideMaster({
    title: 'PRO_TITLE',
    background: { color: colors.background },
    margin: marginTRBL as any,
    objects: [
      { rect: { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: colors.accent } } },
      { rect: { x: 0, y: 0.1, w: '100%', h: 0.02, fill: { color: colors.borderLight } } },
      // Soft accent disc bottom-right (simplified as rect)
      { rect: { x: SLIDE.width - 1.4, y: SLIDE.height - 1.4, w: 1.0, h: 1.0, fill: { color: colors.accent, transparency: 90 } } },
    ],
  });
}

/* -------------------------------------------------------------------------------------------------
 * Blocks
 * ------------------------------------------------------------------------------------------------- */
function addTitleSlide(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, fonts: { heading: string; body: string }) {
  const colors = getThemeColors(theme);

  slide.addText(sanitizeText(spec.title, 120) || 'Presentation', {
    x: CONTENT.x,
    y: 1.75,
    w: CONTENT.width,
    h: 1.2,
    fontFace: fonts.heading,
    fontSize: 44,
    color: colors.textPrimary,
    bold: true,
    align: 'center',
    valign: 'middle',
    lineSpacingMultiple: 1.05, // API-supported multiple spacing
  });

  if (spec.paragraph) {
    slide.addText(sanitizeText(spec.paragraph, 240), {
      x: CONTENT.x,
      y: 3.1,
      w: CONTENT.width,
      h: 0.9,
      fontFace: fonts.body,
      fontSize: 20,
      color: colors.textSecondary,
      align: 'center',
      valign: 'middle',
      lineSpacingMultiple: 1.1,
    });
  }

  // Decorative underline
  slide.addShape((slide as any).pres.ShapeType.rect, {
    x: CONTENT.x + CONTENT.width * 0.25,
    y: 4.2,
    w: CONTENT.width * 0.5,
    h: 0.04,
    fill: { color: colors.accent },
    line: { width: 0 },
  });
}

function addContentTitle(slide: pptxgen.Slide, title: string, theme: ProfessionalTheme, fonts: { heading: string }) {
  const colors = getThemeColors(theme);
  slide.addText(sanitizeText(title, 120), {
    x: CONTENT.x,
    y: CONTENT.y,
    w: CONTENT.width,
    h: CONTENT.titleH,
    fontFace: fonts.heading,
    fontSize: LAYOUT.type.title.fontSize,
    color: colors.textPrimary,
    bold: true,
    valign: 'middle',
  });
}

function addBulletsOrParagraph(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, fonts: { body: string }) {
  const colors = getThemeColors(theme);
  const y = CONTENT.y + CONTENT.titleH + LAYOUT.spacing.titleToContent;
  const h = CONTENT.height - CONTENT.titleH - LAYOUT.spacing.titleToContent;

  const bullets = sanitizeBullets(spec.bullets);
  if (bullets.length) {
    slide.addText(bullets.join('\n'), {
      x: CONTENT.x,
      y,
      w: CONTENT.width,
      h,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.bullet.fontSize,
      color: colors.textPrimary,
      bullet: true, // documented bullet API
      lineSpacingMultiple: 1.25, // documented (multiple) spacing
      paraSpaceAfter: 6,
      valign: 'top',
      wrap: true,
    });
  } else if (spec.paragraph) {
    slide.addText(sanitizeText(spec.paragraph, 1200), {
      x: CONTENT.x,
      y,
      w: CONTENT.width,
      h,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.body.fontSize,
      color: colors.textPrimary,
      lineSpacingMultiple: 1.18,
      valign: 'top',
      wrap: true,
    });
  } else {
    slide.addText('Content will be displayed here.', {
      x: CONTENT.x,
      y,
      w: CONTENT.width,
      h,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.body.fontSize,
      color: colors.textSecondary,
      align: 'center',
      valign: 'middle',
    });
  }
}

function addTwoColumn(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, fonts: { body: string; heading: string }) {
  addContentTitle(slide, spec.title, theme, fonts);
  const colors = getThemeColors(theme);
  const y = CONTENT.y + CONTENT.titleH + LAYOUT.spacing.titleToContent;
  const h = CONTENT.height - CONTENT.titleH - LAYOUT.spacing.titleToContent;

  const leftBul = sanitizeBullets(spec.left?.bullets);
  const rightBul = sanitizeBullets(spec.right?.bullets);

  if (leftBul.length) {
    slide.addText(leftBul.join('\n'), {
      x: CONTENT.x,
      y,
      w: colWidth,
      h,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.bullet.fontSize,
      color: colors.textPrimary,
      bullet: true,
      lineSpacingMultiple: 1.25,
      paraSpaceAfter: 6,
      valign: 'top',
    });
  } else if (spec.left?.paragraph) {
    slide.addText(sanitizeText(spec.left.paragraph, 800), {
      x: CONTENT.x,
      y,
      w: colWidth,
      h,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.body.fontSize,
      color: colors.textPrimary,
      lineSpacingMultiple: 1.18,
      valign: 'top',
    });
  }

  if (rightBul.length) {
    slide.addText(rightBul.join('\n'), {
      x: CONTENT.x + colWidth + LAYOUT.spacing.colGap,
      y,
      w: colWidth,
      h,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.bullet.fontSize,
      color: colors.textPrimary,
      bullet: true,
      lineSpacingMultiple: 1.25,
      paraSpaceAfter: 6,
      valign: 'top',
    });
  } else if (spec.right?.paragraph) {
    slide.addText(sanitizeText(spec.right.paragraph, 800), {
      x: CONTENT.x + colWidth + LAYOUT.spacing.colGap,
      y,
      w: colWidth,
      h,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.body.fontSize,
      color: colors.textPrimary,
      lineSpacingMultiple: 1.18,
      valign: 'top',
    });
  }

  // Column divider (subtle)
  slide.addShape((slide as any).pres.ShapeType.rect, {
    x: CONTENT.x + colWidth + LAYOUT.spacing.colGap / 2 - 0.01,
    y,
    w: 0.02,
    h: h * 0.85,
    fill: { color: colors.borderLight },
    line: { width: 0 },
  });
}

/* -------------------------------- Charts ---------------------------------- */

function parseChartDataFromBullets(items?: string[]) {
  if (!Array.isArray(items)) return null;
  const labels: string[] = [];
  const values: number[] = [];

  const patterns: RegExp[] = [
    /^(.+?):\s*(\d+(?:\.\d+)?)%?$/, // Label: 25 / 25%
    /^(.+?)[-–—]\s*(\d+(?:\.\d+)?)$/, // Label - 25
    /^(.+?)\s*\((\d+(?:\.\d+)?)\)$/, // Label (25)
    /^(\d+(?:\.\d+)?)%?\s+(.+)$/, // 25% Label
  ];

  items.forEach((b) => {
    const s = sanitizeText(b, 120);
    for (const re of patterns) {
      const m = s.match(re);
      if (m) {
        const a = Number(m[2] ?? m[1]);
        const l = sanitizeText((m[1] && m[2]) ? m[1] : m[2], 40);
        if (!Number.isNaN(a) && l) {
          labels.push(l);
          values.push(a);
        }
        break;
      }
    }
  });

  if (!labels.length) return null;
  return [{ name: 'Series', labels, values }];
}

function chartTypeFor(data: any[], preferred?: string, pres?: pptxgen): any {
  const n = data?.[0]?.values?.length ?? 0;
  const multi = (data?.length ?? 0) > 1;
  const t = (preferred || '').toLowerCase();
  const CT = (pres as any).ChartType;

  if (t === 'bar' || t === 'column' || t === 'line' || t === 'pie' || t === 'doughnut' || t === 'area') {
    return CT[t as keyof typeof CT];
  }
  if (!multi && n <= 6) return CT.doughnut; // modern, readable
  if (n > 10 || multi) return CT.line;
  return CT.column;
}

function addChartSlide(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, fonts: { heading: string; body: string }) {
  const colors = getThemeColors(theme);
  addContentTitle(slide, spec.title, theme, fonts);

  const chartColors = [
    colors.primary,
    colors.accent,
    colors.textSecondary,
    '10B981', // success
    'F59E0B', // warning
    '3B82F6', // info
  ];

  const data = spec.chart
    ? spec.chart.series.map((s: any) => ({
        name: sanitizeText(s.name, 40) || 'Series',
        labels: (spec.chart!.categories || []).map((c: any) => sanitizeText(String(c), 40)),
        values: (s.data || []).map((v: any) => Number(v) || 0),
      }))
    : parseChartDataFromBullets(spec.bullets);

  const chartType = chartTypeFor(data as any[], spec.chart?.type, (slide as any).pres);

  const opts: pptxgen.IChartOpts = {
    x: CONTENT.x,
    y: CONTENT.y + CONTENT.titleH + LAYOUT.spacing.titleToContent,
    w: CONTENT.width,
    h: CONTENT.height - CONTENT.titleH - LAYOUT.spacing.titleToContent,
    chartColors,
    showLegend: (data as any[])?.length > 1,
    legendPos: 'r',
    title: sanitizeText(spec.chart?.title || spec.title, 80),
    titleFontFace: fonts.heading,
    titleFontSize: 16,
    catGridLine: { style: 'solid', size: 1, color: colors.borderLight },
    valGridLine: { style: 'solid', size: 1, color: colors.borderLight },
    plotArea: { fill: { color: colors.background } },
    showValue: chartType !== (slide as any).pres.ChartType.doughnut && chartType !== (slide as any).pres.ChartType.pie,
    showLabel: chartType === (slide as any).pres.ChartType.line ? false : true,
    showPercent: chartType === (slide as any).pres.ChartType.doughnut || chartType === (slide as any).pres.ChartType.pie,
    showLeaderLines: chartType === (slide as any).pres.ChartType.doughnut || chartType === (slide as any).pres.ChartType.pie,
    holeSize: chartType === (slide as any).pres.ChartType.doughnut ? 40 : undefined,
  };

  if (data && (data as any[])[0]?.labels?.length) {
    slide.addChart(chartType, data as any, opts);
  } else {
    // Fallback: bullets
    addBulletsOrParagraph(slide, spec, theme, { body: fonts.body });
  }
}

/* -------------------------------- Tables ---------------------------------- */

function buildTableData(spec: SlideSpec) {
  // primary: spec.comparisonTable.headers + rows
  if (spec.comparisonTable?.headers && spec.comparisonTable?.rows) {
    const hdr = spec.comparisonTable.headers.map((h: string) => sanitizeText(h, 60));
    const rows = spec.comparisonTable.rows.map((r: string[]) => r.map((c) => sanitizeText(String(c), 140)));
    return [hdr, ...rows];
  }

  // legacy
  if (spec.table?.rows?.length) {
    const headers = spec.table.columns?.map((h: string) => sanitizeText(h, 60)) ?? null;
    const rows = spec.table.rows.map((r: string[]) => r.map((c) => sanitizeText(String(c), 140)));
    return headers ? [headers, ...rows] : rows;
  }

  // from bullets with pipes or colons
  const fromBullets = sanitizeBullets(spec.bullets, 20, 200)
    .map((b) => (b.includes('|') ? b.split('|').map((c) => sanitizeText(c, 100)) : null))
    .filter(Boolean) as string[][];
  return fromBullets.length ? fromBullets : null;
}

function addTableSlide(slide: pptxgen.Slide, spec: SlideSpec, theme: ProfessionalTheme, fonts: { heading: string; body: string }) {
  const colors = getThemeColors(theme);
  addContentTitle(slide, spec.title, theme, fonts);

  const data = buildTableData(spec);
  if (!data || !data.length) {
    slide.addText('No table data.', {
      x: CONTENT.x,
      y: CONTENT.y + CONTENT.titleH + 0.2,
      w: CONTENT.width,
      h: 0.8,
      fontFace: fonts.body,
      fontSize: LAYOUT.type.body.fontSize,
      color: colors.textSecondary,
      align: 'center',
      valign: 'middle',
      italic: true as any,
    });
    return;
  }

  // Convert to cell-level styling (header + alternating rows)
  const [header, ...rows] = data;
  const styled: pptxgen.TableRow[] = [];

  styled.push(
    header.map((h: string) => ({
      text: h,
      options: {
        bold: true,
        fontFace: fonts.heading,
        fontSize: 15,
        color: 'FFFFFF',
        fill: { color: colors.primary },
        align: 'left',
      },
    }))
  );

  rows.forEach((r: string[], i: number) => {
    const fill = i % 2 === 0 ? colors.surface : colors.background;
    styled.push(
      r.map((c: string) => ({
        text: c,
        options: {
          fontFace: fonts.body,
          fontSize: 14,
          color: colors.textPrimary,
          fill: { color: fill },
        },
      }))
    );
  });

  slide.addTable(styled, {
    x: CONTENT.x,
    y: CONTENT.y + CONTENT.titleH + LAYOUT.spacing.titleToContent,
    w: CONTENT.width,
    border: { color: colors.borderMedium, pt: 1 },
    colW: new Array(data[0].length).fill(CONTENT.width / data[0].length),
    // omit `h`/`rowH` to let content size naturally; avoids overflow/corruption
    margin: 0.04,
  });
}

/* -------------------------------- Notes ---------------------------------- */
function buildSpeakerNotes(spec: SlideSpec, idx: number, total: number): string {
  const lines: string[] = [];
  lines.push(`SLIDE ${idx}/${total}: ${sanitizeText(spec.title, 100)}`);
  if (spec.paragraph) lines.push(`Key: ${sanitizeText(spec.paragraph, 200)}`);
  if (spec.bullets?.length) {
    lines.push('Discuss:');
    sanitizeBullets(spec.bullets, 6, 150).forEach((b, i) => lines.push(`  ${i + 1}. ${b}`));
  }
  return lines.join('\n');
}

/* -------------------------------- Validation ---------------------------------- */
function validateBuffer(buffer: Buffer, context: LogContext) {
  if (!buffer || buffer.length === 0) throw new Error('PPT buffer empty');
  const sig = buffer.subarray(0, 4);
  const pk = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
  if (!sig.equals(pk)) {
    logger.error('Invalid ZIP signature', context, {
      actual: Array.from(sig).map((b) => b.toString(16)),
      size: buffer.length,
    });
    throw new Error('Invalid PPTX signature');
  }
  if (buffer.length < 12000) {
    logger.warn('Very small PPTX; check slide content', context, { size: buffer.length });
  }
}

/* -------------------------------------------------------------------------------------------------
 * Main API
 * ------------------------------------------------------------------------------------------------- */
export async function generateSimplePpt(
  specs: SlideSpec[],
  themeId?: string,
  options: {
    includeMetadata?: boolean;
    includeSpeakerNotes?: boolean;
    optimizeFileSize?: boolean;
    author?: string;
    company?: string;
    subject?: string;
  } = {}
): Promise<Buffer> {
  const context: LogContext = {
    requestId: `ppt_${Date.now()}`,
    component: 'pptGenerator',
    operation: 'generateSimplePpt',
  };

  if (!Array.isArray(specs) || specs.length === 0) throw new Error('No slide specs provided');
  specs.forEach((s, i) => {
    if (!s || typeof s !== 'object' || !sanitizeText(s.title)) throw new Error(`Slide ${i + 1} missing valid title`);
  });

  // Init presentation
  const pres = new pptxgen();
  pres.defineLayout({ name: 'LAYOUT_16x9', width: SLIDE.width, height: SLIDE.height });
  pres.layout = 'LAYOUT_16x9';

  const theme = PROFESSIONAL_THEMES.find((t) => t.id === themeId) || PROFESSIONAL_THEMES[0];
  const fonts = getFonts(theme);
  const colors = getThemeColors(theme);

  // Theme defaults (fonts/language)
  pres.theme = { headFontFace: fonts.heading, bodyFontFace: fonts.body, lang: 'en-US' } as any; // documented API  [oai_citation:7‡gitbrent.github.io](https://gitbrent.github.io/PptxGenJS/docs/usage-pres-options/?utm_source=chatgpt.com)

  // Metadata
  if (options.includeMetadata !== false) {
    pres.author = sanitizeText(options.author, 60) || 'AI PowerPoint Generator';
    pres.company = sanitizeText(options.company, 60) || 'Professional Presentations';
    pres.subject = sanitizeText(options.subject, 120) || 'AI-Generated Presentation';
    pres.title = sanitizeText(specs[0].title, 80) || 'Presentation';
  }

  // Masters
  defineMasters(pres, theme); // documented API for consistent backgrounds  [oai_citation:8‡gitbrent.github.io](https://gitbrent.github.io/PptxGenJS/docs/masters/)

  logger.info(`Generating ${specs.length} slides`, context, { theme: theme.id });

  // Slides
  specs.forEach((raw, i) => {
    const spec = { ...raw, title: sanitizeText(raw.title, 200) || `Slide ${i + 1}` };
    const isTitle = (spec.layout || '').toLowerCase() === 'title' || i === 0;

    const slide = pres.addSlide({ masterName: isTitle ? 'PRO_TITLE' : 'PRO_CONTENT' });

    try {
      switch ((spec.layout || '').toLowerCase()) {
        case 'title':
          addTitleSlide(slide, spec, theme, fonts);
          break;
        case 'chart':
          addChartSlide(slide, spec, theme, fonts);
          break;
        case 'comparison-table':
          addTableSlide(slide, spec, theme, fonts);
          break;
        case 'two-column':
          addTwoColumn(slide, spec, theme, fonts);
          break;
        default:
          addContentTitle(slide, spec.title, theme, fonts);
          addBulletsOrParagraph(slide, spec, theme, { body: fonts.body });
      }

      // Speaker notes
      if (options.includeSpeakerNotes) {
        slide.addNotes(sanitizeText(buildSpeakerNotes(spec, i + 1, specs.length), 2000));
      }

      // Slide number (custom "x / n")
      slide.addText(`${i + 1} / ${specs.length}`, {
        x: SLIDE.width - 1.2,
        y: SLIDE.height - 0.35,
        w: 1.0,
        h: 0.3,
        fontFace: fonts.body,
        fontSize: 10,
        color: colors.textMuted,
        align: 'right',
        valign: 'middle',
      });
    } catch (err) {
      logger.warn(`Slide ${i + 1} failed; adding minimal fallback`, context, { err });
      const fb = pres.addSlide({ masterName: 'PRO_CONTENT' });
      fb.addText(spec.title, {
        x: CONTENT.x, y: 2.2, w: CONTENT.width, h: 0.8,
        fontFace: fonts.heading, fontSize: 28, color: colors.textPrimary, bold: true, align: 'center'
      });
    }
  });

  // Save
  const buffer = (await pres.write({
    outputType: 'nodebuffer',
    compression: options.optimizeFileSize === true, // documented output options  [oai_citation:9‡gitbrent.github.io](https://gitbrent.github.io/PptxGenJS/docs/usage-saving/)
  })) as Buffer;

  validateBuffer(buffer, context);
  return buffer;
}

// Backward-compatible alias
export const generatePpt = generateSimplePpt;