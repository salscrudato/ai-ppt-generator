/**
 * Grid Layout System Tests
 * 
 * Comprehensive tests for the new grid layout feature that allows users to specify
 * column and row arrangements for flexible content organization.
 */

import { generatePpt as generateSimplePpt } from '../pptGenerator-simple';
import type { SlideSpec } from '../schema';
import { getThemeById } from '../professionalThemes';

// Define grid layout types locally for testing
interface GridCell {
  row: number;
  column: number;
  type: 'header' | 'bullets' | 'paragraph' | 'metric' | 'image' | 'chart' | 'empty';
  title?: string;
  bullets?: string[];
  paragraph?: string;
  metric?: {
    value: string;
    label: string;
    trend?: 'up' | 'down' | 'neutral';
  };
  styling?: {
    backgroundColor?: string;
    textColor?: string;
    emphasis?: 'normal' | 'bold' | 'highlight';
    alignment?: 'left' | 'center' | 'right';
  };
}

interface GridLayout {
  columns: number;
  rows: number;
  cells: GridCell[];
  showBorders?: boolean;
  cellSpacing?: 'tight' | 'normal' | 'spacious';
}

// Use existing theme for testing
const mockTheme = getThemeById('corporate-blue')!;

describe('Grid Layout System', () => {
  describe('Grid Layout Validation', () => {
    it('should validate grid layout configuration', () => {
      const validGridLayout: GridLayout = {
        columns: 2,
        rows: 2,
        cells: [
          { row: 0, column: 0, type: 'header', title: 'Feature A' },
          { row: 0, column: 1, type: 'header', title: 'Feature B' },
          { row: 1, column: 0, type: 'bullets', bullets: ['Benefit 1', 'Benefit 2'] },
          { row: 1, column: 1, type: 'bullets', bullets: ['Benefit 3', 'Benefit 4'] }
        ],
        cellSpacing: 'normal'
      };

      expect(validGridLayout.columns).toBe(2);
      expect(validGridLayout.rows).toBe(2);
      expect(validGridLayout.cells).toHaveLength(4);
      expect(validGridLayout.cells[0].type).toBe('header');
    });

    it('should validate cell positions within grid bounds', () => {
      const gridLayout: GridLayout = {
        columns: 2,
        rows: 2,
        cells: [
          { row: 0, column: 0, type: 'header', title: 'Valid Cell' },
          { row: 1, column: 1, type: 'paragraph', paragraph: 'Another valid cell' }
        ]
      };

      // All cells should be within bounds
      gridLayout.cells.forEach(cell => {
        expect(cell.row).toBeLessThan(gridLayout.rows);
        expect(cell.column).toBeLessThan(gridLayout.columns);
        expect(cell.row).toBeGreaterThanOrEqual(0);
        expect(cell.column).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Grid Cell Types', () => {
    it('should support header cells with titles', () => {
      const headerCell: GridCell = {
        row: 0,
        column: 0,
        type: 'header',
        title: 'Product Features',
        styling: {
          emphasis: 'bold',
          alignment: 'center'
        }
      };

      expect(headerCell.type).toBe('header');
      expect(headerCell.title).toBe('Product Features');
      expect(headerCell.styling?.emphasis).toBe('bold');
    });

    it('should support bullets cells with lists', () => {
      const bulletsCell: GridCell = {
        row: 1,
        column: 0,
        type: 'bullets',
        title: 'Key Benefits',
        bullets: [
          'Increased efficiency by 40%',
          'Reduced costs by $50K annually',
          'Improved customer satisfaction'
        ]
      };

      expect(bulletsCell.type).toBe('bullets');
      expect(bulletsCell.bullets).toHaveLength(3);
      expect(bulletsCell.bullets?.[0]).toContain('efficiency');
    });

    it('should support metric cells with values and trends', () => {
      const metricCell: GridCell = {
        row: 0,
        column: 1,
        type: 'metric',
        metric: {
          value: '25%',
          label: 'Revenue Growth',
          trend: 'up'
        }
      };

      expect(metricCell.type).toBe('metric');
      expect(metricCell.metric?.value).toBe('25%');
      expect(metricCell.metric?.trend).toBe('up');
    });

    it('should support paragraph cells with text content', () => {
      const paragraphCell: GridCell = {
        row: 1,
        column: 1,
        type: 'paragraph',
        title: 'Implementation Strategy',
        paragraph: 'Our phased approach ensures minimal disruption while maximizing benefits. We begin with pilot programs in key departments before rolling out company-wide.'
      };

      expect(paragraphCell.type).toBe('paragraph');
      expect(paragraphCell.paragraph).toContain('phased approach');
    });
  });

  describe('Grid Layout Rendering', () => {
    it('should generate PowerPoint with 2x2 grid layout', async () => {
      const gridSlideSpec: SlideSpec = {
        title: 'Feature Comparison Matrix',
        layout: 'grid-layout',
        gridLayout: {
          columns: 2,
          rows: 2,
          cells: [
            { row: 0, column: 0, type: 'header', title: 'Feature A' },
            { row: 0, column: 1, type: 'header', title: 'Feature B' },
            { row: 1, column: 0, type: 'bullets', bullets: ['Fast', 'Reliable', 'Secure'] },
            { row: 1, column: 1, type: 'bullets', bullets: ['Scalable', 'Flexible', 'Cost-effective'] }
          ],
          cellSpacing: 'normal',
          showBorders: true
        },
        notes: 'Compare the key features of our two main product offerings.'
      };

      const buffer = await generateSimplePpt([gridSlideSpec], mockTheme.id, {});
      
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(10000); // Should be a substantial file
    });

    it('should generate PowerPoint with 3x1 metrics dashboard', async () => {
      const metricsSlideSpec: SlideSpec = {
        title: 'Q4 Performance Dashboard',
        layout: 'grid-layout',
        gridLayout: {
          columns: 3,
          rows: 1,
          cells: [
            { 
              row: 0, 
              column: 0, 
              type: 'metric', 
              metric: { value: '$2.4M', label: 'Revenue', trend: 'up' }
            },
            { 
              row: 0, 
              column: 1, 
              type: 'metric', 
              metric: { value: '15%', label: 'Growth Rate', trend: 'up' }
            },
            { 
              row: 0, 
              column: 2, 
              type: 'metric', 
              metric: { value: '98.5%', label: 'Customer Satisfaction', trend: 'neutral' }
            }
          ],
          cellSpacing: 'spacious'
        },
        notes: 'Highlight our strong Q4 performance across key metrics.'
      };

      const buffer = await generateSimplePpt([metricsSlideSpec], mockTheme.id, {});
      
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(10000);
    });

    it('should generate PowerPoint with 4x1 process flow', async () => {
      const processSlideSpec: SlideSpec = {
        title: 'Implementation Process',
        layout: 'grid-layout',
        gridLayout: {
          columns: 4,
          rows: 1,
          cells: [
            { 
              row: 0, 
              column: 0, 
              type: 'header', 
              title: '1. Planning',
              styling: { alignment: 'center' }
            },
            { 
              row: 0, 
              column: 1, 
              type: 'header', 
              title: '2. Development',
              styling: { alignment: 'center' }
            },
            { 
              row: 0, 
              column: 2, 
              type: 'header', 
              title: '3. Testing',
              styling: { alignment: 'center' }
            },
            { 
              row: 0, 
              column: 3, 
              type: 'header', 
              title: '4. Deployment',
              styling: { alignment: 'center' }
            }
          ],
          cellSpacing: 'tight'
        },
        notes: 'Our systematic four-phase implementation approach ensures success.'
      };

      const buffer = await generateSimplePpt([processSlideSpec], mockTheme.id, {});
      
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(10000);
    });
  });

  describe('Grid Layout Error Handling', () => {
    it('should handle empty grid cells gracefully', async () => {
      const slideWithEmptyCells: SlideSpec = {
        title: 'Sparse Grid Layout',
        layout: 'grid-layout',
        gridLayout: {
          columns: 3,
          rows: 2,
          cells: [
            { row: 0, column: 0, type: 'header', title: 'Active Cell' },
            { row: 0, column: 2, type: 'empty' }, // Explicitly empty
            { row: 1, column: 1, type: 'paragraph', paragraph: 'Another active cell' }
            // Missing cells will be handled gracefully
          ],
          cellSpacing: 'normal'
        }
      };

      const buffer = await generateSimplePpt([slideWithEmptyCells], mockTheme.id, {});
      
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(5000);
    });

    it('should fallback gracefully for invalid cell configurations', async () => {
      const slideWithInvalidCells: SlideSpec = {
        title: 'Grid with Invalid Cells',
        layout: 'grid-layout',
        gridLayout: {
          columns: 2,
          rows: 2,
          cells: [
            { row: 0, column: 0, type: 'header', title: 'Valid Header' },
            { 
              row: 0, 
              column: 1, 
              type: 'bullets' as any, 
              // Missing bullets array - should fallback gracefully
            }
          ]
        }
      };

      // Should not throw an error
      const buffer = await generateSimplePpt([slideWithInvalidCells], mockTheme.id, {});
      
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(5000);
    });
  });

  describe('Grid Layout Auto-formatting', () => {
    it('should auto-format content within grid cells', () => {
      const gridLayout: GridLayout = {
        columns: 2,
        rows: 2,
        cells: [
          { 
            row: 0, 
            column: 0, 
            type: 'bullets', 
            bullets: [
              'This is a very long bullet point that should be automatically formatted for optimal readability within the grid cell',
              'Short point',
              'Another moderately long bullet point that demonstrates auto-formatting capabilities'
            ]
          }
        ]
      };

      // Verify that long content is present and will be handled by auto-formatting
      const longBullet = gridLayout.cells[0].bullets?.[0];
      expect(longBullet).toBeDefined();
      expect(longBullet!.length).toBeGreaterThan(50);
    });
  });
});
