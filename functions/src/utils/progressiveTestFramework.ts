/**
 * Progressive PowerPoint Functionality Testing Framework
 * Gradually adds features to identify corruption points
 */

import pptxgen from 'pptxgenjs';
import fs from 'fs/promises';
import path from 'path';
import { logger } from './smartLogger';

export interface ProgressiveTest {
  id: string;
  name: string;
  description: string;
  buildFunction: (pres: any) => Promise<void>;
  expectedFeatures: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ProgressiveTestResult {
  testId: string;
  passed: boolean;
  fileSize: number;
  hasValidSignature: boolean;
  generationTime: number;
  features: string[];
  errorDetails?: string;
  powerPointCompatible?: boolean; // To be filled manually
}

export class ProgressivePowerPointTester {
  private outputDir: string;
  
  constructor(outputDir: string = './progressive-test-output') {
    this.outputDir = outputDir;
  }

  /**
   * Level 1: Absolute Minimum - Empty Presentation
   */
  static getLevel1Tests(): ProgressiveTest[] {
    return [
      {
        id: 'level1-empty',
        name: 'Empty Presentation',
        description: 'Completely empty presentation with no content',
        buildFunction: async (pres) => {
          // Literally nothing - just the presentation object
        },
        expectedFeatures: ['basic-structure'],
        riskLevel: 'low'
      },
      {
        id: 'level1-single-slide',
        name: 'Single Empty Slide',
        description: 'One slide with no content',
        buildFunction: async (pres) => {
          pres.addSlide();
        },
        expectedFeatures: ['basic-structure', 'slide-creation'],
        riskLevel: 'low'
      }
    ];
  }

  /**
   * Level 2: Basic Text - Minimal Text Content
   */
  static getLevel2Tests(): ProgressiveTest[] {
    return [
      {
        id: 'level2-simple-text',
        name: 'Simple Text',
        description: 'Single slide with minimal text',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();
          slide.addText('Hello', {
            x: 1,
            y: 1,
            w: 2,
            h: 1
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'text-basic'],
        riskLevel: 'low'
      },
      {
        id: 'level2-styled-text',
        name: 'Styled Text',
        description: 'Text with basic styling (font, size, color)',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();
          slide.addText('Styled Text', {
            x: 1,
            y: 1,
            w: 4,
            h: 1,
            fontSize: 16,
            fontFace: 'Calibri',
            color: '333333'
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'text-basic', 'text-styling'],
        riskLevel: 'low'
      },
      {
        id: 'level2-multiple-text',
        name: 'Multiple Text Elements',
        description: 'Multiple text elements on one slide',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();
          slide.addText('Title', {
            x: 1, y: 1, w: 8, h: 1,
            fontSize: 24, fontFace: 'Calibri', color: '1E40AF', bold: true
          });
          slide.addText('Content', {
            x: 1, y: 2.5, w: 8, h: 2,
            fontSize: 16, fontFace: 'Calibri', color: '333333'
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'text-basic', 'text-styling', 'multiple-elements'],
        riskLevel: 'medium'
      }
    ];
  }

  /**
   * Level 3: Advanced Text - Bullets, Formatting, Special Characters
   */
  static getLevel3Tests(): ProgressiveTest[] {
    return [
      {
        id: 'level3-bullets',
        name: 'Bullet Points',
        description: 'Text with bullet point formatting',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();
          slide.addText('Point 1\nPoint 2\nPoint 3', {
            x: 1, y: 1, w: 8, h: 3,
            fontSize: 16, fontFace: 'Calibri', color: '333333',
            bullet: { type: 'bullet', style: '•' }
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'text-basic', 'text-styling', 'bullets'],
        riskLevel: 'medium'
      },
      {
        id: 'level3-special-chars',
        name: 'Special Characters',
        description: 'Text with special characters and symbols',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();
          slide.addText('Special: © ® ™ € $ % & @', {
            x: 1, y: 1, w: 8, h: 1,
            fontSize: 16, fontFace: 'Calibri', color: '333333'
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'text-basic', 'text-styling', 'special-characters'],
        riskLevel: 'medium'
      },
      {
        id: 'level3-long-text',
        name: 'Long Text Content',
        description: 'Large amount of text content',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();
          const longText = 'This is a very long text content that spans multiple lines and contains various words and phrases to test how PowerPoint handles larger text blocks. '.repeat(5);
          slide.addText(longText, {
            x: 1, y: 1, w: 8, h: 4,
            fontSize: 14, fontFace: 'Calibri', color: '333333',
            wrap: true
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'text-basic', 'text-styling', 'long-content'],
        riskLevel: 'medium'
      }
    ];
  }

  /**
   * Level 4: Layout Features - Shapes, Tables, Charts
   */
  static getLevel4Tests(): ProgressiveTest[] {
    return [
      {
        id: 'level4-shapes',
        name: 'Basic Shapes',
        description: 'Simple geometric shapes',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();
          slide.addShape(pres.ShapeType.rect, {
            x: 1, y: 1, w: 2, h: 1,
            fill: { color: '1E40AF' }
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'shapes'],
        riskLevel: 'medium'
      },
      {
        id: 'level4-table-simple',
        name: 'Simple Table',
        description: 'Basic table with minimal data',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();
          slide.addTable([
            ['Header 1', 'Header 2'],
            ['Data 1', 'Data 2']
          ], {
            x: 1, y: 1, w: 6, h: 2
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'tables'],
        riskLevel: 'high'
      },
      {
        id: 'level4-chart-simple',
        name: 'Simple Chart',
        description: 'Basic chart with minimal data',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();
          slide.addChart(pres.ChartType.bar, [
            { name: 'Series 1', labels: ['A', 'B'], values: [10, 20] }
          ], {
            x: 1, y: 1, w: 6, h: 4
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'charts'],
        riskLevel: 'high'
      }
    ];
  }

  /**
   * Level 5: Advanced Features - Images, Notes, Metadata
   */
  static getLevel5Tests(): ProgressiveTest[] {
    return [
      {
        id: 'level5-notes',
        name: 'Speaker Notes',
        description: 'Slide with speaker notes',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();
          slide.addText('Slide Content', {
            x: 1, y: 1, w: 8, h: 1,
            fontSize: 24, fontFace: 'Calibri', color: '1E40AF'
          });
          slide.addNotes('These are speaker notes for this slide.');
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'text-basic', 'speaker-notes'],
        riskLevel: 'medium'
      },
      {
        id: 'level5-metadata',
        name: 'Presentation Metadata',
        description: 'Presentation with title, author, and metadata',
        buildFunction: async (pres) => {
          pres.title = 'Test Presentation';
          pres.author = 'Test Author';
          pres.company = 'Test Company';
          pres.subject = 'Test Subject';
          
          const slide = pres.addSlide();
          slide.addText('Presentation with Metadata', {
            x: 1, y: 1, w: 8, h: 1,
            fontSize: 24, fontFace: 'Calibri', color: '1E40AF'
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'text-basic', 'metadata'],
        riskLevel: 'low'
      }
    ];
  }

  /**
   * Level 6: Real-World Complexity - Mimics actual generator patterns
   */
  static getLevel6Tests(): ProgressiveTest[] {
    return [
      {
        id: 'level6-complex-slide',
        name: 'Complex Slide Layout',
        description: 'Slide with multiple elements like our generator creates',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();

          // Title with specific styling
          slide.addText('Q4 Review: 30% Revenue Growth Drives $3.5M Success', {
            x: 1, y: 0.5, w: 8, h: 1,
            fontSize: 20, fontFace: 'Calibri', color: '1E40AF', bold: true
          });

          // Bullet points with our exact formatting
          slide.addText('Key achievements this quarter\nRevenue increased by 30% year-over-year\nCustomer satisfaction improved to 95%\nNew product launch exceeded targets', {
            x: 1, y: 2, w: 8, h: 3,
            fontSize: 16, fontFace: 'Calibri', color: '333333',
            bullet: { type: 'bullet', style: '•' },
            lineSpacing: 1.2
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'text-basic', 'text-styling', 'bullets', 'complex-layout'],
        riskLevel: 'high'
      }
    ];
  }

  /**
   * Level 7: Professional Backgrounds & Themes
   */
  static getLevel7Tests(): ProgressiveTest[] {
    return [
      {
        id: 'level7-solid-background',
        name: 'Solid Color Background',
        description: 'Slide with solid color background',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();
          slide.background = { color: 'F8FAFC' };

          slide.addText('Professional Background Test', {
            x: 1, y: 2, w: 8, h: 1,
            fontSize: 24, fontFace: 'Calibri', color: '1E40AF', bold: true, align: 'center'
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'text-basic', 'solid-background'],
        riskLevel: 'medium'
      },
      {
        id: 'level7-themed-background',
        name: 'Themed Background',
        description: 'Slide with theme-specific background colors',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();
          slide.background = { color: 'F1F5F9' }; // Safe solid background

          slide.addText('Themed Background Test', {
            x: 1, y: 2, w: 8, h: 1,
            fontSize: 24, fontFace: 'Calibri', color: '1E40AF', bold: true, align: 'center'
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'text-basic', 'themed-background'],
        riskLevel: 'low'
      },
      {
        id: 'level7-master-layout',
        name: 'Custom Master Layout',
        description: 'Slide with custom master layout properties',
        buildFunction: async (pres) => {
          // Define custom layout
          pres.defineLayout({
            name: 'CUSTOM_PROFESSIONAL',
            width: 10,
            height: 5.625
          });
          pres.layout = 'CUSTOM_PROFESSIONAL';

          const slide = pres.addSlide();
          slide.addText('Custom Layout Test', {
            x: 1, y: 2, w: 8, h: 1,
            fontSize: 24, fontFace: 'Calibri', color: '1E40AF', bold: true, align: 'center'
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'text-basic', 'custom-layout'],
        riskLevel: 'medium'
      }
    ];
  }

  /**
   * Level 8: Advanced Shapes & Graphics
   */
  static getLevel8Tests(): ProgressiveTest[] {
    return [
      {
        id: 'level8-multiple-shapes',
        name: 'Multiple Shape Types',
        description: 'Various geometric shapes with styling',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();

          // Rectangle with styling
          slide.addShape(pres.ShapeType.rect, {
            x: 1, y: 1, w: 2, h: 1,
            fill: { color: '1E40AF' },
            line: { color: '1E40AF', width: 2 }
          });

          // Circle
          slide.addShape(pres.ShapeType.ellipse, {
            x: 4, y: 1, w: 1.5, h: 1.5,
            fill: { color: '0EA5E9' },
            line: { color: '0EA5E9', width: 1 }
          });

          // Triangle
          slide.addShape(pres.ShapeType.triangle, {
            x: 6.5, y: 1, w: 1.5, h: 1.5,
            fill: { color: 'F59E0B' },
            line: { color: 'F59E0B', width: 1 }
          });

          slide.addText('Shape Gallery', {
            x: 1, y: 3, w: 8, h: 1,
            fontSize: 20, fontFace: 'Calibri', color: '333333', align: 'center'
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'shapes', 'multiple-shapes', 'shape-styling'],
        riskLevel: 'medium'
      },
      {
        id: 'level8-shape-with-text',
        name: 'Shapes with Text Content',
        description: 'Shapes containing text elements',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();

          // Text box with background
          slide.addText('Key Point', {
            x: 2, y: 2, w: 6, h: 1.5,
            fontSize: 18, fontFace: 'Calibri', color: 'FFFFFF', bold: true,
            align: 'center', valign: 'middle',
            fill: { color: '1E40AF' },
            line: { color: '1E40AF', width: 2 }
          });

          // Callout shape with text
          slide.addShape(pres.ShapeType.roundRect, {
            x: 1, y: 4, w: 8, h: 1,
            fill: { color: 'F1F5F9' },
            line: { color: 'E2E8F0', width: 1 }
          });

          slide.addText('Important Information', {
            x: 1.2, y: 4.2, w: 7.6, h: 0.6,
            fontSize: 14, fontFace: 'Calibri', color: '475569'
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'shapes', 'text-in-shapes', 'callouts'],
        riskLevel: 'high'
      },
      {
        id: 'level8-complex-graphics',
        name: 'Complex Graphic Elements',
        description: 'Advanced graphic combinations',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();

          // Header with background
          slide.addShape(pres.ShapeType.rect, {
            x: 0, y: 0, w: 10, h: 1,
            fill: { color: '1E40AF' },
            line: { width: 0 }
          });

          slide.addText('Professional Header', {
            x: 0.5, y: 0.2, w: 9, h: 0.6,
            fontSize: 20, fontFace: 'Calibri', color: 'FFFFFF', bold: true
          });

          // Content area with border
          slide.addShape(pres.ShapeType.rect, {
            x: 0.5, y: 1.5, w: 9, h: 3.5,
            fill: { color: 'FFFFFF' },
            line: { color: 'E2E8F0', width: 1 }
          });

          slide.addText('Content Area\n• Professional layout\n• Clean design\n• Corporate styling', {
            x: 1, y: 2, w: 8, h: 2.5,
            fontSize: 16, fontFace: 'Calibri', color: '333333',
            bullet: { type: 'bullet', style: '•' }
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'shapes', 'complex-graphics', 'layered-elements'],
        riskLevel: 'high'
      }
    ];
  }

  /**
   * Level 9: Professional Charts & Data Visualization
   */
  static getLevel9Tests(): ProgressiveTest[] {
    return [
      {
        id: 'level9-bar-chart',
        name: 'Professional Bar Chart',
        description: 'Styled bar chart with multiple series',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();

          slide.addText('Revenue Growth Analysis', {
            x: 1, y: 0.5, w: 8, h: 1,
            fontSize: 20, fontFace: 'Calibri', color: '1E40AF', bold: true
          });

          slide.addChart(pres.ChartType.bar, [
            {
              name: 'Q3 2023',
              labels: ['Product A', 'Product B', 'Product C'],
              values: [2.5, 1.8, 3.2]
            },
            {
              name: 'Q4 2023',
              labels: ['Product A', 'Product B', 'Product C'],
              values: [3.2, 2.4, 4.1]
            }
          ], {
            x: 1, y: 1.5, w: 8, h: 3.5,
            chartColors: ['1E40AF', '0EA5E9', 'F59E0B'],
            showTitle: true,
            title: 'Quarterly Revenue ($M)'
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'charts', 'bar-chart', 'multi-series'],
        riskLevel: 'high'
      },
      {
        id: 'level9-line-chart',
        name: 'Professional Line Chart',
        description: 'Line chart with trend analysis',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();

          slide.addText('Growth Trends', {
            x: 1, y: 0.5, w: 8, h: 1,
            fontSize: 20, fontFace: 'Calibri', color: '1E40AF', bold: true
          });

          slide.addChart(pres.ChartType.line, [
            {
              name: 'Revenue',
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              values: [100, 120, 140, 160, 180, 200]
            },
            {
              name: 'Profit',
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              values: [20, 28, 35, 45, 58, 72]
            }
          ], {
            x: 1, y: 1.5, w: 8, h: 3.5,
            chartColors: ['1E40AF', '10B981'],
            showTitle: true,
            title: 'Financial Performance Trends'
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'charts', 'line-chart', 'trend-analysis'],
        riskLevel: 'high'
      },
      {
        id: 'level9-pie-chart',
        name: 'Professional Pie Chart',
        description: 'Pie chart with market share data',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();

          slide.addText('Market Share Distribution', {
            x: 1, y: 0.5, w: 8, h: 1,
            fontSize: 20, fontFace: 'Calibri', color: '1E40AF', bold: true
          });

          slide.addChart(pres.ChartType.pie, [
            {
              name: 'Market Share',
              labels: ['Our Company', 'Competitor A', 'Competitor B', 'Others'],
              values: [35, 25, 20, 20]
            }
          ], {
            x: 2, y: 1.5, w: 6, h: 3.5,
            chartColors: ['1E40AF', '0EA5E9', 'F59E0B', 'E5E7EB'],
            showTitle: true,
            title: 'Market Share (%)'
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'charts', 'pie-chart', 'market-data'],
        riskLevel: 'high'
      }
    ];
  }

  /**
   * Level 10: Stress Test - Real-World Professional Presentation
   */
  static getLevel10Tests(): ProgressiveTest[] {
    return [
      {
        id: 'level10-stress-test',
        name: 'Complete Professional Presentation Stress Test',
        description: 'Full presentation with all working features combined',
        buildFunction: async (pres) => {
          // Title slide with solid background
          const titleSlide = pres.addSlide();
          titleSlide.background = { color: 'F8FAFC' };

          titleSlide.addText('Q4 Business Review 2023', {
            x: 1, y: 2, w: 8, h: 1.5,
            fontSize: 36, fontFace: 'Calibri', color: '1E40AF', bold: true, align: 'center'
          });

          titleSlide.addText('Driving Growth Through Innovation & Excellence', {
            x: 1, y: 3.5, w: 8, h: 1,
            fontSize: 18, fontFace: 'Calibri', color: '64748B', align: 'center'
          });

          titleSlide.addNotes('Welcome to our Q4 business review. This presentation covers our exceptional performance this quarter and strategic direction for 2024.');

          // Executive summary with shapes and text
          const summarySlide = pres.addSlide();

          // Header shape
          summarySlide.addShape(pres.ShapeType.rect, {
            x: 0, y: 0, w: 10, h: 1,
            fill: { color: '1E40AF' }
          });

          summarySlide.addText('Executive Summary', {
            x: 0.5, y: 0.2, w: 9, h: 0.6,
            fontSize: 24, fontFace: 'Calibri', color: 'FFFFFF', bold: true
          });

          // KPI boxes with shapes
          const kpis = [
            { title: 'Revenue', value: '$3.2M', growth: '+28%', x: 0.5 },
            { title: 'Customers', value: '1,800', growth: '+50%', x: 3.5 },
            { title: 'Market Share', value: '18%', growth: '+3pp', x: 6.5 }
          ];

          kpis.forEach(kpi => {
            summarySlide.addShape(pres.ShapeType.roundRect, {
              x: kpi.x, y: 1.5, w: 2.8, h: 2,
              fill: { color: 'F1F5F9' },
              line: { color: 'E2E8F0', width: 1 }
            });

            summarySlide.addText(`${kpi.title}\n${kpi.value}\n${kpi.growth}`, {
              x: kpi.x + 0.1, y: 1.7, w: 2.6, h: 1.6,
              fontSize: 16, fontFace: 'Calibri', color: '1E40AF', bold: true, align: 'center'
            });
          });

          summarySlide.addText('Key Achievements This Quarter\n• Exceeded revenue targets by 28%\n• Customer base grew by 50%\n• Market share increased to 18%\n• Launched 3 new products successfully', {
            x: 1, y: 4, w: 8, h: 1.5,
            fontSize: 16, fontFace: 'Calibri', color: '333333',
            bullet: { type: 'bullet', style: '•' }
          });

          summarySlide.addNotes('This slide highlights our key achievements for Q4. Revenue growth of 28% exceeded our target of 25%. Customer acquisition has been particularly strong.');

          // Revenue chart slide
          const chartSlide = pres.addSlide();

          chartSlide.addText('Revenue Performance Analysis', {
            x: 1, y: 0.5, w: 8, h: 1,
            fontSize: 24, fontFace: 'Calibri', color: '1E40AF', bold: true
          });

          chartSlide.addChart(pres.ChartType.bar, [
            {
              name: 'Q4 2023',
              labels: ['Product A', 'Product B', 'Product C', 'New Products'],
              values: [1.2, 0.8, 0.9, 0.3]
            },
            {
              name: 'Q3 2023',
              labels: ['Product A', 'Product B', 'Product C', 'New Products'],
              values: [1.0, 0.7, 0.8, 0.0]
            }
          ], {
            x: 1, y: 1.5, w: 8, h: 3.5,
            chartColors: ['1E40AF', '64748B'],
            showTitle: true,
            title: 'Revenue by Product Line ($M)'
          });

          chartSlide.addNotes('The chart shows strong performance across all product lines, with new products contributing $300K in their first quarter.');

          // Data table slide
          const tableSlide = pres.addSlide();

          tableSlide.addText('Detailed Performance Metrics', {
            x: 1, y: 0.5, w: 8, h: 1,
            fontSize: 24, fontFace: 'Calibri', color: '1E40AF', bold: true
          });

          const tableData = [
            [
              { text: 'Metric', options: { bold: true, color: 'FFFFFF', fill: '1E40AF' } },
              { text: 'Q3 2023', options: { bold: true, color: 'FFFFFF', fill: '1E40AF' } },
              { text: 'Q4 2023', options: { bold: true, color: 'FFFFFF', fill: '1E40AF' } },
              { text: 'Growth', options: { bold: true, color: 'FFFFFF', fill: '1E40AF' } },
              { text: 'Target', options: { bold: true, color: 'FFFFFF', fill: '1E40AF' } }
            ],
            ['Revenue ($M)', '2.5', '3.2', '+28%', '25%'],
            ['Gross Profit ($M)', '1.0', '1.4', '+40%', '35%'],
            ['Net Profit ($M)', '0.5', '0.8', '+60%', '50%'],
            ['Customers', '1,200', '1,800', '+50%', '40%'],
            ['Avg Order Value', '$2,083', '$1,778', '-15%', '+5%'],
            ['Customer Satisfaction', '92%', '95%', '+3pp', '90%']
          ];

          tableSlide.addTable(tableData, {
            x: 0.5, y: 1.5, w: 9, h: 3.5,
            border: { type: 'solid', color: 'E2E8F0', pt: 1 }
          });

          tableSlide.addNotes('This comprehensive table shows we exceeded targets in most areas. The slight decrease in average order value is offset by the significant increase in customer volume.');

          // Conclusion slide with multiple elements
          const conclusionSlide = pres.addSlide();

          conclusionSlide.addText('Looking Forward: 2024 Strategy', {
            x: 1, y: 0.5, w: 8, h: 1,
            fontSize: 24, fontFace: 'Calibri', color: '1E40AF', bold: true
          });

          // Strategic pillars with shapes
          const pillars = [
            { title: 'Growth', items: ['Expand to 3 new markets', 'Launch 5 new products'], x: 0.5, color: '1E40AF' },
            { title: 'Innovation', items: ['AI integration', 'Customer experience'], x: 5, color: '0EA5E9' }
          ];

          pillars.forEach(pillar => {
            conclusionSlide.addShape(pres.ShapeType.rect, {
              x: pillar.x, y: 1.5, w: 4, h: 2.5,
              fill: { color: 'F8FAFC' },
              line: { color: pillar.color, width: 2 }
            });

            conclusionSlide.addText(pillar.title, {
              x: pillar.x + 0.2, y: 1.7, w: 3.6, h: 0.5,
              fontSize: 18, fontFace: 'Calibri', color: pillar.color, bold: true, align: 'center'
            });

            conclusionSlide.addText(pillar.items.join('\n'), {
              x: pillar.x + 0.2, y: 2.3, w: 3.6, h: 1.5,
              fontSize: 14, fontFace: 'Calibri', color: '333333',
              bullet: { type: 'bullet', style: '•' }
            });
          });

          conclusionSlide.addText('Thank you for your continued support and dedication!', {
            x: 1, y: 4.5, w: 8, h: 0.8,
            fontSize: 20, fontFace: 'Calibri', color: '1E40AF', bold: true, align: 'center'
          });

          conclusionSlide.addNotes('In conclusion, Q4 has been exceptional. Our 2024 strategy focuses on sustainable growth and continued innovation to maintain our competitive advantage.');
        },
        expectedFeatures: ['complete-presentation', 'all-safe-features', 'stress-test'],
        riskLevel: 'high'
      }
    ];
  }

  /**
   * Level 11: Real Failing Content Tests
   * Tests using exact content from actual failing presentations
   */
  static getLevel11Tests(): ProgressiveTest[] {
    return [
      {
        id: 'level11-failing-title-1',
        name: 'Actual Failing Title 1',
        description: 'Test with exact title from failing presentation',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();

          // Exact title from your failing presentation
          slide.addText('Launch Success: New Product to Drive 25% Revenue Growth', {
            x: 1, y: 2.5, w: 8, h: 1.5,
            fontSize: 32, fontFace: 'Calibri', color: '1E40AF', bold: true, align: 'center'
          });

          slide.addText('Strategic Initiative Overview', {
            x: 1, y: 4, w: 8, h: 1,
            fontSize: 18, fontFace: 'Calibri', color: '64748B', align: 'center'
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'text-basic', 'failing-content-1'],
        riskLevel: 'high'
      },
      {
        id: 'level11-failing-title-2',
        name: 'Actual Failing Title 2',
        description: 'Test with exact title from second failing presentation',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();

          // Exact title from your second failing presentation
          slide.addText('Q4 Review: 30% Revenue Growth Drives $3.5M Success', {
            x: 1, y: 2.5, w: 8, h: 1.5,
            fontSize: 32, fontFace: 'Calibri', color: '1E40AF', bold: true, align: 'center'
          });

          slide.addText('Financial Performance Analysis', {
            x: 1, y: 4, w: 8, h: 1,
            fontSize: 18, fontFace: 'Calibri', color: '64748B', align: 'center'
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'text-basic', 'failing-content-2'],
        riskLevel: 'high'
      },
      {
        id: 'level11-complex-content',
        name: 'Complex Content with Special Characters',
        description: 'Test content with special characters, symbols, and formatting',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();

          slide.addText('Q4 Review: 30% Revenue Growth Drives $3.5M Success', {
            x: 1, y: 0.5, w: 8, h: 1,
            fontSize: 24, fontFace: 'Calibri', color: '1E40AF', bold: true
          });

          // Content with potential problematic characters
          slide.addText('Key achievements this quarter:\n• Revenue increased by 30% year-over-year\n• Customer satisfaction improved to 95%\n• Market share grew from 15% to 18%\n• Launched 3 new products with $500K+ revenue\n• Employee retention rate: 92% (industry avg: 85%)', {
            x: 1, y: 2, w: 8, h: 3,
            fontSize: 16, fontFace: 'Calibri', color: '333333',
            bullet: { type: 'bullet', style: '•' },
            lineSpacing: 1.2
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'text-basic', 'bullets', 'special-chars', 'complex-content'],
        riskLevel: 'high'
      },
      {
        id: 'level11-financial-data',
        name: 'Financial Data with Symbols',
        description: 'Test financial data with currency symbols and percentages',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();

          slide.addText('Financial Performance Metrics', {
            x: 1, y: 0.5, w: 8, h: 1,
            fontSize: 24, fontFace: 'Calibri', color: '1E40AF', bold: true
          });

          const tableData = [
            [
              { text: 'Metric', options: { bold: true, color: 'FFFFFF', fill: '1E40AF' } },
              { text: 'Q3 2023', options: { bold: true, color: 'FFFFFF', fill: '1E40AF' } },
              { text: 'Q4 2023', options: { bold: true, color: 'FFFFFF', fill: '1E40AF' } },
              { text: 'Growth', options: { bold: true, color: 'FFFFFF', fill: '1E40AF' } }
            ],
            ['Revenue', '$2.5M', '$3.2M', '+28%'],
            ['Profit Margin', '20%', '25%', '+5pp'],
            ['Customer LTV', '$1,250', '$1,450', '+16%'],
            ['CAC Ratio', '3.2:1', '4.1:1', '+28%'],
            ['EBITDA', '$500K', '$800K', '+60%']
          ];

          slide.addTable(tableData, {
            x: 1, y: 1.5, w: 8, h: 3.5,
            border: { type: 'solid', color: 'E2E8F0', pt: 1 }
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'tables', 'financial-data', 'currency-symbols'],
        riskLevel: 'high'
      },
      {
        id: 'level11-long-content',
        name: 'Long Content with Complex Text',
        description: 'Test with very long content that might cause issues',
        buildFunction: async (pres) => {
          const slide = pres.addSlide();

          slide.addText('Strategic Overview & Market Analysis', {
            x: 1, y: 0.5, w: 8, h: 1,
            fontSize: 24, fontFace: 'Calibri', color: '1E40AF', bold: true
          });

          const longContent = `Our comprehensive market analysis reveals significant opportunities for growth in the upcoming fiscal year. The competitive landscape has shifted dramatically, with emerging technologies creating new market segments worth approximately $2.3 billion globally. Our strategic positioning allows us to capture an estimated 15-20% market share within the next 18 months, translating to potential revenue of $345-460 million. Key success factors include: (1) accelerated product development cycles, (2) enhanced customer acquisition strategies, (3) strategic partnerships with industry leaders, (4) investment in AI/ML capabilities, and (5) expansion into three new geographic markets. Risk mitigation strategies have been developed to address potential challenges including supply chain disruptions, regulatory changes, and competitive responses. The financial projections indicate a 35-40% increase in EBITDA, with break-even expected by Q2 2024.`;

          slide.addText(longContent, {
            x: 1, y: 1.5, w: 8, h: 3.5,
            fontSize: 14, fontFace: 'Calibri', color: '333333',
            wrap: true,
            lineSpacing: 1.3
          });
        },
        expectedFeatures: ['basic-structure', 'slide-creation', 'text-basic', 'long-content', 'complex-text'],
        riskLevel: 'high'
      },
      {
        id: 'level11-complete-failing-presentation',
        name: 'Complete Failing Presentation Recreation',
        description: 'Full recreation of a failing presentation structure',
        buildFunction: async (pres) => {
          // Title slide - exact recreation
          const titleSlide = pres.addSlide();
          titleSlide.background = { color: 'F8FAFC' };

          titleSlide.addText('Launch Success: New Product to Drive 25% Revenue Growth', {
            x: 1, y: 2, w: 8, h: 1.5,
            fontSize: 36, fontFace: 'Calibri', color: '1E40AF', bold: true, align: 'center'
          });

          titleSlide.addText('Strategic Initiative Overview & Financial Impact Analysis', {
            x: 1, y: 3.5, w: 8, h: 1,
            fontSize: 18, fontFace: 'Calibri', color: '64748B', align: 'center'
          });

          titleSlide.addNotes('Welcome to our launch success presentation. This covers our new product initiative that has driven significant revenue growth and market expansion.');

          // Content slide with problematic content
          const contentSlide = pres.addSlide();

          contentSlide.addText('Q4 Review: 30% Revenue Growth Drives $3.5M Success', {
            x: 1, y: 0.5, w: 8, h: 1,
            fontSize: 24, fontFace: 'Calibri', color: '1E40AF', bold: true
          });

          contentSlide.addText('Key Performance Indicators & Market Impact:\n• Revenue increased by 30% year-over-year ($2.5M → $3.2M)\n• Customer base expanded by 50% (1,200 → 1,800 customers)\n• Market share grew from 15% to 18% (+3 percentage points)\n• Customer satisfaction improved to 95% (industry benchmark: 87%)\n• Employee retention rate: 92% vs industry average of 85%\n• New product line contributed $500K+ in first quarter\n• Average customer lifetime value increased by 16% ($1,250 → $1,450)', {
            x: 1, y: 1.5, w: 8, h: 3.5,
            fontSize: 16, fontFace: 'Calibri', color: '333333',
            bullet: { type: 'bullet', style: '•' },
            lineSpacing: 1.2
          });

          contentSlide.addNotes('This slide highlights our exceptional Q4 performance. The 30% revenue growth exceeded our target of 25%, driven primarily by our new product launch and improved customer retention strategies.');

          // Data slide with complex table
          const dataSlide = pres.addSlide();

          dataSlide.addText('Detailed Financial Analysis & Projections', {
            x: 1, y: 0.5, w: 8, h: 1,
            fontSize: 24, fontFace: 'Calibri', color: '1E40AF', bold: true
          });

          const complexTableData = [
            [
              { text: 'Financial Metric', options: { bold: true, color: 'FFFFFF', fill: '1E40AF' } },
              { text: 'Q3 2023', options: { bold: true, color: 'FFFFFF', fill: '1E40AF' } },
              { text: 'Q4 2023', options: { bold: true, color: 'FFFFFF', fill: '1E40AF' } },
              { text: 'Growth %', options: { bold: true, color: 'FFFFFF', fill: '1E40AF' } },
              { text: '2024 Target', options: { bold: true, color: 'FFFFFF', fill: '1E40AF' } }
            ],
            ['Total Revenue', '$2,500,000', '$3,200,000', '+28%', '$4,000,000'],
            ['Gross Profit', '$1,000,000', '$1,400,000', '+40%', '$1,800,000'],
            ['Net Profit Margin', '20%', '25%', '+5pp', '28%'],
            ['Customer Acquisition Cost', '$125', '$98', '-22%', '$85'],
            ['Customer Lifetime Value', '$1,250', '$1,450', '+16%', '$1,650'],
            ['Monthly Recurring Revenue', '$208K', '$267K', '+28%', '$333K'],
            ['Churn Rate', '5.2%', '3.8%', '-27%', '3.0%'],
            ['Employee Satisfaction', '87%', '92%', '+6%', '95%']
          ];

          dataSlide.addTable(complexTableData, {
            x: 0.5, y: 1.5, w: 9, h: 3.5,
            border: { type: 'solid', color: 'E2E8F0', pt: 1 }
          });

          dataSlide.addNotes('This comprehensive financial analysis shows strong performance across all key metrics. The improvement in customer acquisition cost while increasing lifetime value demonstrates the effectiveness of our strategic initiatives.');
        },
        expectedFeatures: ['complete-presentation', 'failing-content-recreation', 'complex-data', 'financial-metrics'],
        riskLevel: 'high'
      }
    ];
  }

  /**
   * Run a specific test level
   */
  async runTestLevel(level: number): Promise<ProgressiveTestResult[]> {
    let tests: ProgressiveTest[];
    
    switch (level) {
      case 1: tests = ProgressivePowerPointTester.getLevel1Tests(); break;
      case 2: tests = ProgressivePowerPointTester.getLevel2Tests(); break;
      case 3: tests = ProgressivePowerPointTester.getLevel3Tests(); break;
      case 4: tests = ProgressivePowerPointTester.getLevel4Tests(); break;
      case 5: tests = ProgressivePowerPointTester.getLevel5Tests(); break;
      case 6: tests = ProgressivePowerPointTester.getLevel6Tests(); break;
      case 7: tests = ProgressivePowerPointTester.getLevel7Tests(); break;
      case 8: tests = ProgressivePowerPointTester.getLevel8Tests(); break;
      case 9: tests = ProgressivePowerPointTester.getLevel9Tests(); break;
      case 10: tests = ProgressivePowerPointTester.getLevel10Tests(); break;
      case 11: tests = ProgressivePowerPointTester.getLevel11Tests(); break;
      default: throw new Error(`Invalid test level: ${level}`);
    }

    logger.info(`Running Level ${level} tests (${tests.length} tests)`);
    
    await this.ensureOutputDir();
    const results: ProgressiveTestResult[] = [];

    for (const test of tests) {
      const result = await this.runSingleTest(test);
      results.push(result);
      
      if (result.passed) {
        await this.saveTestFile(test, result);
      }
      
      logger.info(`Test ${test.id}: ${result.passed ? 'PASSED' : 'FAILED'} (${result.generationTime}ms)`);
    }

    return results;
  }

  /**
   * Run a single progressive test
   */
  private async runSingleTest(test: ProgressiveTest): Promise<ProgressiveTestResult> {
    const startTime = Date.now();
    
    try {
      const pres = new pptxgen();
      
      // Set basic layout
      pres.defineLayout({
        name: 'PROGRESSIVE_TEST',
        width: 10,
        height: 5.625
      });
      pres.layout = 'PROGRESSIVE_TEST';
      
      // Execute the test's build function
      await test.buildFunction(pres);
      
      // Generate buffer
      const buffer = await pres.write({
        outputType: 'nodebuffer',
        compression: true
      }) as Buffer;
      
      const generationTime = Date.now() - startTime;
      const hasValidSignature = this.validateZipSignature(buffer);
      
      return {
        testId: test.id,
        passed: hasValidSignature && buffer.length > 1000,
        fileSize: buffer.length,
        hasValidSignature,
        generationTime,
        features: test.expectedFeatures
      };
      
    } catch (error) {
      return {
        testId: test.id,
        passed: false,
        fileSize: 0,
        hasValidSignature: false,
        generationTime: Date.now() - startTime,
        features: test.expectedFeatures,
        errorDetails: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private validateZipSignature(buffer: Buffer): boolean {
    if (buffer.length < 4) return false;
    const signature = buffer.subarray(0, 4);
    const expectedSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
    return signature.equals(expectedSignature);
  }

  private async ensureOutputDir(): Promise<void> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  private async saveTestFile(test: ProgressiveTest, result: ProgressiveTestResult): Promise<void> {
    try {
      const pres = new pptxgen();
      pres.defineLayout({
        name: 'PROGRESSIVE_TEST',
        width: 10,
        height: 5.625
      });
      pres.layout = 'PROGRESSIVE_TEST';
      
      await test.buildFunction(pres);
      
      const buffer = await pres.write({
        outputType: 'nodebuffer',
        compression: true
      }) as Buffer;
      
      const filename = `${test.id}.pptx`;
      const filepath = path.join(this.outputDir, filename);
      await fs.writeFile(filepath, buffer);
      
      logger.debug(`Saved progressive test file: ${filepath}`);
    } catch (error) {
      logger.warn(`Failed to save progressive test file for ${test.id}:`, { error });
    }
  }
}
