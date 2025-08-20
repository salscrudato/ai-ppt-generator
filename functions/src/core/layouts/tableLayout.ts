/*
 * Table layout implementation (comparison-table)
 */

import type pptxgen from 'pptxgenjs';
import type { SlideSpec } from '../../schema';
import { addTitle, addAccentBar, sanitizeText } from '../primitives';
import { TABLE_DEFAULTS, FONT_SIZES } from '../constants';

export function createComparisonTableLayout(slide: pptxgen.Slide, spec: SlideSpec, colors: any) {
  const title = sanitizeText(spec.title);
  
  // Add title
  addTitle(slide, title, colors);
  
  // Add accent bar
  addAccentBar(slide, colors);
  
  // Add table
  if (spec.table && spec.table.headers && spec.table.rows) {
    try {
      const tableData = [
        spec.table.headers,
        ...spec.table.rows
      ];
      
      slide.addTable(tableData, {
        x: TABLE_DEFAULTS.x,
        y: TABLE_DEFAULTS.y,
        w: TABLE_DEFAULTS.width,
        h: TABLE_DEFAULTS.height,
        fontSize: FONT_SIZES.small,
        fontFace: 'Segoe UI',
        color: colors.text.primary,
        fill: { color: colors.surface },
        border: { pt: 1, color: colors.secondary },
        rowH: TABLE_DEFAULTS.rowHeight,
        colW: TABLE_DEFAULTS.width / spec.table.headers.length,
      });
      
      // Style header row
      slide.addTable([spec.table.headers], {
        x: TABLE_DEFAULTS.x,
        y: TABLE_DEFAULTS.y,
        w: TABLE_DEFAULTS.width,
        h: TABLE_DEFAULTS.headerHeight,
        fontSize: FONT_SIZES.small,
        fontFace: 'Segoe UI',
        color: 'FFFFFF',
        fill: { color: colors.primary },
        border: { pt: 1, color: colors.secondary },
        bold: true,
        align: 'center',
        valign: 'middle',
      });
    } catch (error) {
      console.warn('Failed to add table, using fallback:', error);
      
      // Fallback: text representation
      let tableText = spec.table.headers.join(' | ') + '\n';
      tableText += spec.table.rows.map((row: any) => row.join(' | ')).join('\n');
      
      slide.addText(tableText, {
        x: TABLE_DEFAULTS.x,
        y: TABLE_DEFAULTS.y,
        w: TABLE_DEFAULTS.width,
        h: TABLE_DEFAULTS.height,
        fontSize: FONT_SIZES.small,
        fontFace: 'Courier New',
        color: colors.text.primary,
        align: 'left',
        valign: 'top',
      });
    }
  }
}
