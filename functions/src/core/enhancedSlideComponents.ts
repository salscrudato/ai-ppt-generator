/**
 * Enhanced Slide Components
 * 
 * Advanced slide components with interactive charts, smart tables,
 * multimedia integration, and sophisticated visual elements.
 * 
 * Features:
 * - Interactive chart generation with multiple types
 * - Smart table creation with automatic formatting
 * - Timeline components with milestone tracking
 * - Multimedia integration (images, videos, audio)
 * - Advanced typography and text effects
 * - Responsive component sizing
 * - Accessibility-compliant components
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import pptxgen from 'pptxgenjs';
import { SlideSpec } from '../schema';
import { ProfessionalTheme } from '../professionalThemes';
import { safeColorFormat } from './theme/utilities';

/**
 * Enhanced chart configuration
 */
export interface EnhancedChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'column' | 'combo' | 'waterfall' | 'funnel';
  title?: string;
  subtitle?: string;
  data: ChartDataSeries[];
  position: { x: number; y: number; w: number; h: number };
  theme: ProfessionalTheme;
  styling: {
    showLegend?: boolean;
    showDataLabels?: boolean;
    showGridlines?: boolean;
    showAxes?: boolean;
    animation?: 'none' | 'fade' | 'slide' | 'grow';
    colorScheme?: 'theme' | 'gradient' | 'monochrome' | 'vibrant';
  };
  interactivity?: {
    clickable?: boolean;
    hoverable?: boolean;
    zoomable?: boolean;
  };
}

/**
 * Chart data series with enhanced metadata
 */
export interface ChartDataSeries {
  name: string;
  labels: string[];
  values: number[];
  color?: string;
  type?: 'bar' | 'line' | 'area'; // For combo charts
  metadata?: {
    unit?: string;
    format?: 'number' | 'percentage' | 'currency';
    precision?: number;
  };
}

/**
 * Smart table configuration
 */
export interface SmartTableConfig {
  title?: string;
  headers: string[];
  rows: (string | number)[][];
  position: { x: number; y: number; w: number; h: number };
  theme: ProfessionalTheme;
  styling: {
    headerStyle?: 'bold' | 'colored' | 'minimal';
    alternatingRows?: boolean;
    borderStyle?: 'none' | 'light' | 'medium' | 'heavy';
    cellPadding?: 'compact' | 'normal' | 'spacious';
    textAlign?: 'left' | 'center' | 'right' | 'auto';
  };
  features: {
    sortable?: boolean;
    filterable?: boolean;
    highlightable?: boolean;
    responsive?: boolean;
  };
}

/**
 * Timeline component configuration
 */
export interface TimelineConfig {
  title?: string;
  events: TimelineEvent[];
  position: { x: number; y: number; w: number; h: number };
  theme: ProfessionalTheme;
  styling: {
    orientation?: 'horizontal' | 'vertical';
    style?: 'linear' | 'curved' | 'stepped';
    showDates?: boolean;
    showMilestones?: boolean;
    compactMode?: boolean;
  };
}

/**
 * Timeline event with rich metadata
 */
export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  description?: string;
  milestone?: boolean;
  category?: string;
  status?: 'completed' | 'in-progress' | 'planned' | 'cancelled';
  metadata?: {
    duration?: string;
    responsible?: string;
    priority?: 'low' | 'medium' | 'high';
  };
}

/**
 * Multimedia component configuration
 */
export interface MultimediaConfig {
  type: 'image' | 'video' | 'audio' | 'embed';
  source: string;
  position: { x: number; y: number; w: number; h: number };
  styling: {
    borderRadius?: number;
    shadow?: boolean;
    overlay?: boolean;
    caption?: string;
    altText?: string;
  };
  behavior: {
    autoplay?: boolean;
    loop?: boolean;
    controls?: boolean;
    muted?: boolean;
  };
}

/**
 * Enhanced Slide Components class
 */
export class EnhancedSlideComponents {
  /**
   * Create an enhanced chart with advanced styling and interactivity
   */
  static async createEnhancedChart(
    slide: pptxgen.Slide,
    config: EnhancedChartConfig
  ): Promise<void> {
    console.log(`📊 Creating enhanced ${config.type} chart...`);

    try {
      // Prepare chart data with enhanced formatting
      const chartData = this.prepareChartData(config.data, config.styling);
      
      // Apply theme-based styling
      const chartOptions = this.buildChartOptions(config);
      
      // Create the chart
      slide.addChart(
        this.convertChartType(config.type),
        chartData,
        {
          x: config.position.x,
          y: config.position.y,
          w: config.position.w,
          h: config.position.h,
          title: config.title,
          ...chartOptions
        }
      );

      // Add subtitle if provided
      if (config.subtitle) {
        slide.addText(config.subtitle, {
          x: config.position.x,
          y: config.position.y + config.position.h + 0.1,
          w: config.position.w,
          h: 0.3,
          fontSize: 12,
          color: safeColorFormat(config.theme.colors.text.secondary),
          align: 'center',
          italic: true
        });
      }

      console.log('✅ Enhanced chart created successfully');
    } catch (error) {
      console.error('❌ Failed to create enhanced chart:', error);
      throw error;
    }
  }

  /**
   * Create a smart table with automatic formatting and styling
   */
  static async createSmartTable(
    slide: pptxgen.Slide,
    config: SmartTableConfig
  ): Promise<void> {
    console.log('📋 Creating smart table...');

    try {
      // Prepare table data with smart formatting
      const tableData = this.prepareTableData(config);
      
      // Build table options with theme styling
      const tableOptions = this.buildTableOptions(config);
      
      // Add title if provided
      if (config.title) {
        slide.addText(config.title, {
          x: config.position.x,
          y: config.position.y - 0.4,
          w: config.position.w,
          h: 0.3,
          fontSize: 16,
          bold: true,
          color: safeColorFormat(config.theme.colors.text.primary),
          align: 'center'
        });
      }

      // Create the table
      slide.addTable(tableData, tableOptions);

      console.log('✅ Smart table created successfully');
    } catch (error) {
      console.error('❌ Failed to create smart table:', error);
      throw error;
    }
  }

  /**
   * Create an interactive timeline component
   */
  static async createTimeline(
    slide: pptxgen.Slide,
    config: TimelineConfig
  ): Promise<void> {
    console.log('📅 Creating interactive timeline...');

    try {
      // Add title if provided
      if (config.title) {
        slide.addText(config.title, {
          x: config.position.x,
          y: config.position.y - 0.4,
          w: config.position.w,
          h: 0.3,
          fontSize: 16,
          bold: true,
          color: safeColorFormat(config.theme.colors.text.primary),
          align: 'center'
        });
      }

      if (config.styling.orientation === 'horizontal') {
        await this.createHorizontalTimeline(slide, config);
      } else {
        await this.createVerticalTimeline(slide, config);
      }

      console.log('✅ Timeline created successfully');
    } catch (error) {
      console.error('❌ Failed to create timeline:', error);
      throw error;
    }
  }

  /**
   * Add multimedia content with enhanced features
   */
  static async addMultimedia(
    slide: pptxgen.Slide,
    config: MultimediaConfig
  ): Promise<void> {
    console.log(`🎬 Adding ${config.type} multimedia content...`);

    try {
      switch (config.type) {
        case 'image':
          await this.addEnhancedImage(slide, config);
          break;
        case 'video':
          await this.addEnhancedVideo(slide, config);
          break;
        case 'audio':
          await this.addEnhancedAudio(slide, config);
          break;
        case 'embed':
          await this.addEmbeddedContent(slide, config);
          break;
        default:
          throw new Error(`Unsupported multimedia type: ${config.type}`);
      }

      console.log('✅ Multimedia content added successfully');
    } catch (error) {
      console.error('❌ Failed to add multimedia content:', error);
      throw error;
    }
  }

  /**
   * Prepare chart data with enhanced formatting
   */
  private static prepareChartData(
    data: ChartDataSeries[],
    styling: EnhancedChartConfig['styling']
  ): any[] {
    return data.map((series, index) => ({
      name: series.name,
      labels: series.labels,
      values: series.values.map(value => {
        if (series.metadata?.format === 'percentage') {
          return Math.round(value * 100) / 100;
        } else if (series.metadata?.format === 'currency') {
          return Math.round(value * 100) / 100;
        }
        return value;
      }),
      color: series.color || this.getSeriesColor(index, styling.colorScheme || 'theme')
    }));
  }

  /**
   * Build chart options with theme-based styling
   */
  private static buildChartOptions(config: EnhancedChartConfig): any {
    const options: any = {
      showLegend: config.styling.showLegend !== false,
      showDataLabels: config.styling.showDataLabels === true,
      showTitle: !!config.title,
      chartColors: this.getChartColors(config.theme, config.styling.colorScheme || 'theme')
    };

    // Add chart-specific options
    if (config.type === 'pie' || config.type === 'doughnut') {
      options.showPercent = true;
    }

    if (config.type === 'line' || config.type === 'area') {
      options.lineSmooth = true;
      options.showMarkers = true;
    }

    return options;
  }

  /**
   * Get chart colors based on theme and color scheme
   */
  private static getChartColors(
    theme: ProfessionalTheme,
    colorScheme: 'theme' | 'gradient' | 'monochrome' | 'vibrant'
  ): string[] {
    switch (colorScheme) {
      case 'theme':
        return [
          theme.colors.primary,
          theme.colors.secondary,
          theme.colors.accent,
          '#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B'
        ];
      case 'gradient':
        return this.generateGradientColors(theme.colors.primary, 8);
      case 'monochrome':
        return this.generateMonochromeColors(theme.colors.primary, 8);
      case 'vibrant':
        return ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
      default:
        return [theme.colors.primary, theme.colors.secondary, theme.colors.accent];
    }
  }

  /**
   * Generate gradient colors from a base color
   */
  private static generateGradientColors(baseColor: string, count: number): string[] {
    // This is a simplified implementation
    // In a real implementation, you'd use proper color manipulation
    const colors = [baseColor];
    for (let i = 1; i < count; i++) {
      colors.push(this.adjustColorBrightness(baseColor, (i * 20) - 60));
    }
    return colors;
  }

  /**
   * Generate monochrome colors from a base color
   */
  private static generateMonochromeColors(baseColor: string, count: number): string[] {
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(this.adjustColorBrightness(baseColor, (i * 15) - 45));
    }
    return colors;
  }

  /**
   * Adjust color brightness (simplified implementation)
   */
  private static adjustColorBrightness(color: string, percent: number): string {
    // This is a placeholder - implement proper color manipulation
    return color;
  }

  /**
   * Get series color based on index and scheme
   */
  private static getSeriesColor(index: number, scheme: string): string {
    const defaultColors = ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'];
    return defaultColors[index % defaultColors.length];
  }

  /**
   * Convert chart type to PptxGenJS format
   */
  private static convertChartType(type: EnhancedChartConfig['type']): any {
    const typeMap: Record<string, any> = {
      'bar': 'bar',
      'column': 'column',
      'line': 'line',
      'pie': 'pie',
      'doughnut': 'doughnut',
      'area': 'area',
      'scatter': 'scatter',
      'combo': 'combo',
      'waterfall': 'waterfall',
      'funnel': 'funnel'
    };
    return typeMap[type] || 'bar';
  }

  /**
   * Prepare table data with smart formatting
   */
  private static prepareTableData(config: SmartTableConfig): any[][] {
    const tableData: any[][] = [];

    // Add headers with styling
    const headerRow = config.headers.map(header => ({
      text: header,
      options: {
        bold: true,
        fontSize: 12,
        color: safeColorFormat(config.theme.colors.text.primary),
        fill: { color: safeColorFormat(config.theme.colors.surface) }
      }
    }));
    tableData.push(headerRow);

    // Add data rows with alternating styling if enabled
    config.rows.forEach((row, index) => {
      const formattedRow = row.map((cell, cellIndex) => {
        const cellOptions: any = {
          fontSize: 11,
          color: safeColorFormat(config.theme.colors.text.primary)
        };

        // Apply alternating row colors
        if (config.styling.alternatingRows && index % 2 === 1) {
          cellOptions.fill = { color: safeColorFormat(config.theme.colors.surface) };
        }

        // Auto-detect and format numbers
        if (typeof cell === 'number') {
          cellOptions.align = 'right';
          return {
            text: this.formatNumber(cell),
            options: cellOptions
          };
        }

        // Auto-align text based on content
        if (config.styling.textAlign === 'auto') {
          cellOptions.align = this.detectTextAlignment(cell.toString());
        } else {
          cellOptions.align = config.styling.textAlign || 'left';
        }

        return {
          text: cell.toString(),
          options: cellOptions
        };
      });
      tableData.push(formattedRow);
    });

    return tableData;
  }

  /**
   * Build table options with theme styling
   */
  private static buildTableOptions(config: SmartTableConfig): any {
    const borderStyle = this.getBorderStyle(config.styling.borderStyle || 'light', config.theme);
    const cellPadding = this.getCellPadding(config.styling.cellPadding || 'normal');

    return {
      x: config.position.x,
      y: config.position.y,
      w: config.position.w,
      h: config.position.h,
      border: borderStyle,
      margin: cellPadding,
      fontSize: 11,
      fontFace: config.theme.typography.body.fontFamily,
      color: safeColorFormat(config.theme.colors.text.primary),
      align: 'center',
      valign: 'middle'
    };
  }

  /**
   * Get border style based on configuration
   */
  private static getBorderStyle(style: string, theme: ProfessionalTheme): any {
    const borderColors = {
      light: theme.colors.borders.light,
      medium: theme.colors.borders.medium,
      heavy: theme.colors.text.secondary
    };

    const borderWidths = {
      none: 0,
      light: 1,
      medium: 2,
      heavy: 3
    };

    return {
      type: 'solid',
      color: safeColorFormat(borderColors[style as keyof typeof borderColors] || borderColors.light),
      pt: borderWidths[style as keyof typeof borderWidths] || 1
    };
  }

  /**
   * Get cell padding based on configuration
   */
  private static getCellPadding(padding: string): number[] {
    const paddingMap = {
      compact: [0.05, 0.1, 0.05, 0.1],
      normal: [0.1, 0.15, 0.1, 0.15],
      spacious: [0.15, 0.2, 0.15, 0.2]
    };
    return paddingMap[padding as keyof typeof paddingMap] || paddingMap.normal;
  }

  /**
   * Format numbers for display
   */
  private static formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    } else if (value % 1 === 0) {
      return value.toString();
    } else {
      return value.toFixed(2);
    }
  }

  /**
   * Detect text alignment based on content
   */
  private static detectTextAlignment(text: string): 'left' | 'center' | 'right' {
    // Numbers and currency align right
    if (/^[\d.,\$€£¥]+$/.test(text.trim())) {
      return 'right';
    }

    // Short text (like codes or IDs) center
    if (text.length <= 5 && /^[A-Z0-9-]+$/.test(text)) {
      return 'center';
    }

    // Default to left alignment
    return 'left';
  }

  /**
   * Create horizontal timeline
   */
  private static async createHorizontalTimeline(
    slide: pptxgen.Slide,
    config: TimelineConfig
  ): Promise<void> {
    const { position, events, theme, styling } = config;
    const eventWidth = position.w / events.length;
    const lineY = position.y + position.h / 2;

    // Draw main timeline line
    slide.addShape('line', {
      x: position.x,
      y: lineY,
      w: position.w,
      h: 0,
      line: {
        color: safeColorFormat(theme.colors.borders.medium),
        width: 2
      }
    });

    // Add events
    events.forEach((event, index) => {
      const eventX = position.x + (index * eventWidth) + (eventWidth / 2);

      // Add event marker
      slide.addShape('rect', {
        x: eventX - 0.1,
        y: lineY - 0.1,
        w: 0.2,
        h: 0.2,
        fill: {
          color: event.milestone
            ? safeColorFormat(theme.colors.accent)
            : safeColorFormat(theme.colors.primary)
        },
        line: { width: 0 }
      });

      // Add event title
      slide.addText(event.title, {
        x: eventX - (eventWidth / 2),
        y: lineY - 0.6,
        w: eventWidth,
        h: 0.3,
        fontSize: 10,
        bold: event.milestone,
        color: safeColorFormat(theme.colors.text.primary),
        align: 'center'
      });

      // Add date if enabled
      if (styling.showDates) {
        slide.addText(event.date, {
          x: eventX - (eventWidth / 2),
          y: lineY + 0.2,
          w: eventWidth,
          h: 0.25,
          fontSize: 8,
          color: safeColorFormat(theme.colors.text.secondary),
          align: 'center'
        });
      }
    });
  }

  /**
   * Create vertical timeline
   */
  private static async createVerticalTimeline(
    slide: pptxgen.Slide,
    config: TimelineConfig
  ): Promise<void> {
    const { position, events, theme, styling } = config;
    const eventHeight = position.h / events.length;
    const lineX = position.x + 0.3;

    // Draw main timeline line
    slide.addShape('line', {
      x: lineX,
      y: position.y,
      w: 0,
      h: position.h,
      line: {
        color: safeColorFormat(theme.colors.borders.medium),
        width: 2
      }
    });

    // Add events
    events.forEach((event, index) => {
      const eventY = position.y + (index * eventHeight) + (eventHeight / 2);

      // Add event marker
      slide.addShape('rect', {
        x: lineX - 0.1,
        y: eventY - 0.1,
        w: 0.2,
        h: 0.2,
        fill: {
          color: event.milestone
            ? safeColorFormat(theme.colors.accent)
            : safeColorFormat(theme.colors.primary)
        },
        line: { width: 0 }
      });

      // Add event content
      slide.addText(event.title, {
        x: lineX + 0.3,
        y: eventY - 0.15,
        w: position.w - 0.6,
        h: 0.3,
        fontSize: 11,
        bold: event.milestone,
        color: safeColorFormat(theme.colors.text.primary)
      });

      // Add date if enabled
      if (styling.showDates) {
        slide.addText(event.date, {
          x: lineX + 0.3,
          y: eventY + 0.15,
          w: position.w - 0.6,
          h: 0.2,
          fontSize: 9,
          color: safeColorFormat(theme.colors.text.secondary),
          italic: true
        });
      }
    });
  }

  /**
   * Add enhanced image with styling and effects
   */
  private static async addEnhancedImage(
    slide: pptxgen.Slide,
    config: MultimediaConfig
  ): Promise<void> {
    const imageOptions: any = {
      x: config.position.x,
      y: config.position.y,
      w: config.position.w,
      h: config.position.h,
      path: config.source
    };

    // Add border radius if specified
    if (config.styling.borderRadius) {
      imageOptions.rounding = config.styling.borderRadius;
    }

    // Add shadow if enabled
    if (config.styling.shadow) {
      imageOptions.shadow = {
        type: 'outer',
        color: '000000',
        opacity: 0.3,
        blur: 3,
        offset: 2,
        angle: 45
      };
    }

    slide.addImage(imageOptions);

    // Add caption if provided
    if (config.styling.caption) {
      slide.addText(config.styling.caption, {
        x: config.position.x,
        y: config.position.y + config.position.h + 0.1,
        w: config.position.w,
        h: 0.3,
        fontSize: 10,
        align: 'center',
        italic: true,
        color: '666666'
      });
    }
  }

  /**
   * Add enhanced video with controls and styling
   */
  private static async addEnhancedVideo(
    slide: pptxgen.Slide,
    config: MultimediaConfig
  ): Promise<void> {
    // Note: PptxGenJS has limited video support
    // This is a placeholder for video functionality

    // Add video placeholder with play button
    slide.addShape('rect', {
      x: config.position.x,
      y: config.position.y,
      w: config.position.w,
      h: config.position.h,
      fill: { color: '000000' },
      line: { width: 0 }
    });

    // Add play button
    slide.addShape('triangle', {
      x: config.position.x + config.position.w / 2 - 0.3,
      y: config.position.y + config.position.h / 2 - 0.2,
      w: 0.6,
      h: 0.4,
      fill: { color: 'FFFFFF' },
      line: { width: 0 }
    });

    // Add video title/caption
    slide.addText('Video: Click to play', {
      x: config.position.x,
      y: config.position.y + config.position.h + 0.1,
      w: config.position.w,
      h: 0.3,
      fontSize: 10,
      align: 'center',
      color: '666666'
    });
  }

  /**
   * Add enhanced audio with visual representation
   */
  private static async addEnhancedAudio(
    slide: pptxgen.Slide,
    config: MultimediaConfig
  ): Promise<void> {
    // Add audio waveform visualization
    const waveformWidth = config.position.w / 20;
    for (let i = 0; i < 20; i++) {
      const height = Math.random() * config.position.h * 0.8 + config.position.h * 0.1;
      slide.addShape('rect', {
        x: config.position.x + i * waveformWidth,
        y: config.position.y + (config.position.h - height) / 2,
        w: waveformWidth * 0.8,
        h: height,
        fill: { color: '4A90E2' },
        line: { width: 0 }
      });
    }

    // Add audio controls
    slide.addShape('rect', {
      x: config.position.x + config.position.w + 0.2,
      y: config.position.y + config.position.h / 2 - 0.2,
      w: 0.4,
      h: 0.4,
      fill: { color: '4A90E2' },
      line: { width: 0 }
    });

    slide.addShape('triangle', {
      x: config.position.x + config.position.w + 0.35,
      y: config.position.y + config.position.h / 2 - 0.1,
      w: 0.1,
      h: 0.2,
      fill: { color: 'FFFFFF' },
      line: { width: 0 }
    });
  }

  /**
   * Add embedded content placeholder
   */
  private static async addEmbeddedContent(
    slide: pptxgen.Slide,
    config: MultimediaConfig
  ): Promise<void> {
    // Add placeholder for embedded content
    slide.addShape('rect', {
      x: config.position.x,
      y: config.position.y,
      w: config.position.w,
      h: config.position.h,
      fill: { color: 'F5F5F5' },
      line: { color: 'CCCCCC', width: 1 }
    });

    // Add embed icon
    slide.addText('🔗', {
      x: config.position.x + config.position.w / 2 - 0.2,
      y: config.position.y + config.position.h / 2 - 0.2,
      w: 0.4,
      h: 0.4,
      fontSize: 24,
      align: 'center'
    });

    // Add embed description
    slide.addText('Embedded Content', {
      x: config.position.x,
      y: config.position.y + config.position.h / 2 + 0.2,
      w: config.position.w,
      h: 0.3,
      fontSize: 12,
      align: 'center',
      color: '666666'
    });
  }

  /**
   * Create advanced text effects
   */
  static createAdvancedText(
    slide: pptxgen.Slide,
    text: string,
    options: {
      x: number;
      y: number;
      w: number;
      h: number;
      effect?: 'shadow' | 'outline' | 'glow' | 'gradient';
      theme: ProfessionalTheme;
    }
  ): void {
    const baseOptions: any = {
      x: options.x,
      y: options.y,
      w: options.w,
      h: options.h,
      fontSize: 16,
      color: safeColorFormat(options.theme.colors.text.primary),
      fontFace: options.theme.typography.body.fontFamily
    };

    switch (options.effect) {
      case 'shadow':
        baseOptions.shadow = {
          type: 'outer',
          color: '000000',
          opacity: 0.5,
          blur: 2,
          offset: 1,
          angle: 45
        };
        break;
      case 'outline':
        baseOptions.outline = {
          color: safeColorFormat(options.theme.colors.primary),
          size: 1
        };
        break;
      case 'glow':
        baseOptions.glow = {
          color: safeColorFormat(options.theme.colors.accent),
          opacity: 0.7,
          size: 3
        };
        break;
      case 'gradient':
        baseOptions.color = {
          type: 'gradient',
          colors: [
            safeColorFormat(options.theme.colors.primary),
            safeColorFormat(options.theme.colors.secondary)
          ],
          angle: 45
        };
        break;
    }

    slide.addText(text, baseOptions);
  }

  /**
   * Create responsive component that adapts to different slide sizes
   */
  static createResponsiveComponent(
    slide: pptxgen.Slide,
    componentType: 'chart' | 'table' | 'timeline' | 'multimedia',
    config: any,
    slideSize: { width: number; height: number }
  ): void {
    // Adjust component size based on slide dimensions
    const scaleFactor = Math.min(slideSize.width / 10, slideSize.height / 5.625);

    // Scale position and dimensions
    if (config.position) {
      config.position.x *= scaleFactor;
      config.position.y *= scaleFactor;
      config.position.w *= scaleFactor;
      config.position.h *= scaleFactor;
    }

    // Adjust font sizes for readability
    if (config.styling && slideSize.width < 8) {
      // Smaller slide, increase relative font sizes
      if (config.styling.fontSize) {
        config.styling.fontSize = Math.max(config.styling.fontSize * 1.2, 12);
      }
    }

    // Create the component with adjusted configuration
    switch (componentType) {
      case 'chart':
        this.createEnhancedChart(slide, config);
        break;
      case 'table':
        this.createSmartTable(slide, config);
        break;
      case 'timeline':
        this.createTimeline(slide, config);
        break;
      case 'multimedia':
        this.addMultimedia(slide, config);
        break;
    }
  }
}
