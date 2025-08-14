/**
 * Modern Slide Generators with Enhanced Visual Design
 *
 * Advanced slide generation with modern aesthetics, visual effects,
 * and sophisticated layout components.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import pptxgen from 'pptxgenjs';
import { ModernTheme } from '../core/theme/modernThemes';
import {
  createModernCardBackground,
  createAccentElement,
  createProgressBar,
  createBadge,
  VISUAL_EFFECT_PRESETS,
  applyVisualEffects,
  createThemeGradient,
  createGradientFill
} from '../core/theme/visualEffects';
import {
  createHeroSection,
  createFeatureCallouts,
  createTestimonialCard,
  createDataVisualization
} from './advancedLayoutComponents';

/**
 * Safe color formatting utility
 */
function safeColorFormat(color: string): string {
  if (!color) return '000000';
  const cleanColor = color.replace('#', '').toUpperCase();
  if (!/^[0-9A-F]{6}$/.test(cleanColor)) {
    console.warn(`Invalid color format: ${color}, using default black`);
    return '000000';
  }
  return cleanColor;
}

/**
 * Modern hero slide with gradient background and sophisticated typography
 */
export function createModernHeroSlide(
  slide: any,
  config: {
    title: string;
    subtitle?: string;
    author?: string;
    date?: string;
    backgroundStyle?: 'gradient' | 'minimal' | 'accent';
  },
  theme: ModernTheme
): void {
  // Background with gradient or modern styling
  if (config.backgroundStyle === 'gradient') {
    const backgroundOptions = applyVisualEffects(
      { x: 0, y: 0, w: 10, h: 5.625 },
      VISUAL_EFFECT_PRESETS.HERO_GRADIENT,
      theme
    );
    slide.addShape('rect', backgroundOptions);
  } else if (config.backgroundStyle === 'accent') {
    // Subtle accent background
    const accentBg = createAccentElement(0, 0, 10, 5.625, theme, 'square');
    accentBg.transparency = 95; // Very subtle
    slide.addShape('rect', accentBg);
  }

  // Decorative accent elements
  createAccentElement(0.5, 0.5, 0.3, 0.3, theme, 'circle');
  slide.addShape('ellipse', createAccentElement(0.5, 0.5, 0.3, 0.3, theme, 'circle'));
  
  createAccentElement(9.2, 4.8, 0.5, 0.2, theme, 'pill');
  slide.addShape('rect', createAccentElement(9.2, 4.8, 0.5, 0.2, theme, 'pill'));

  // Main title with enhanced typography - optimized for 16:9
  const titleY = config.subtitle ? 1.5 : 2.0; // Better positioning for 16:9
  slide.addText(config.title, {
    x: 0.75, // Better left margin for 16:9
    y: titleY,
    w: 8.5, // Optimized width for 16:9
    h: 1.2,
    fontSize: theme.typography.fontSizes.display,
    fontFace: theme.typography.fontFamilies.heading,
    color: safeColorFormat(theme.palette.text.primary),
    align: 'center',
    valign: 'middle',
    bold: true,
    lineSpacing: theme.typography.lineHeights.tight * 100
  });

  // Subtitle with modern styling - optimized for 16:9
  if (config.subtitle) {
    slide.addText(config.subtitle, {
      x: 1.25, // Better positioning for 16:9
      y: 2.8,  // Adjusted for better spacing
      w: 7.5,  // Optimized width for 16:9
      h: 0.8,
      fontSize: theme.typography.fontSizes.h3,
      fontFace: theme.typography.fontFamilies.body,
      color: safeColorFormat(theme.palette.text.secondary),
      align: 'center',
      valign: 'middle',
      lineSpacing: theme.typography.lineHeights.normal * 100
    });
  }

  // Author and date in modern card - optimized for 16:9
  if (config.author || config.date) {
    const cardBg = createModernCardBackground(2, 4.2, 6, 0.8, theme, 'subtle'); // Better positioning for 16:9
    slide.addShape('rect', cardBg);

    const infoText = [config.author, config.date].filter(Boolean).join(' • ');
    slide.addText(infoText, {
      x: 2.2,
      y: 4.2, // Adjusted for better 16:9 positioning
      w: 5.6,
      h: 0.8,
      fontSize: theme.typography.fontSizes.body,
      fontFace: theme.typography.fontFamilies.body,
      color: safeColorFormat(theme.palette.text.secondary),
      align: 'center',
      valign: 'middle'
    });
  }
}

/**
 * Modern content slide with enhanced visual hierarchy
 */
export function createModernContentSlide(
  slide: any,
  config: {
    title: string;
    content: string[];
    layout?: 'bullets' | 'cards' | 'timeline';
    accentColor?: string;
  },
  theme: ModernTheme
): void {
  // Title with accent underline - optimized for 16:9
  slide.addText(config.title, {
    x: 0.75, // Better left margin for 16:9
    y: 0.4,  // Higher positioning for more content space
    w: 8.5,  // Optimized width for 16:9
    h: 0.8,
    fontSize: theme.typography.fontSizes.h1,
    fontFace: theme.typography.fontFamilies.heading,
    color: safeColorFormat(theme.palette.text.primary),
    bold: true,
    lineSpacing: theme.typography.lineHeights.tight * 100
  });

  // Accent underline
  const accentLine = createAccentElement(0.75, 1.3, 2, 0.05, theme, 'pill');
  slide.addShape('rect', accentLine);

  const contentY = 1.6;  // Higher content start for more space
  const itemHeight = 0.7; // Slightly smaller for better fit
  const itemSpacing = 0.1;

  config.content.forEach((item, index) => {
    const y = contentY + (index * (itemHeight + itemSpacing));

    if (config.layout === 'cards') {
      // Card-based layout
      const cardBg = createModernCardBackground(0.5, y, 9, itemHeight, theme, 'subtle');
      slide.addShape('rect', cardBg);

      // Bullet point as colored circle
      const bulletColor = config.accentColor || theme.palette.primary;
      slide.addShape('ellipse', {
        x: 0.8,
        y: y + 0.25,
        w: 0.15,
        h: 0.15,
        fill: { color: safeColorFormat(bulletColor) },
        line: { width: 0 }
      });

      slide.addText(item, {
        x: 1.1,
        y: y + 0.1,
        w: 8.2,
        h: itemHeight - 0.2,
        fontSize: theme.typography.fontSizes.body,
        fontFace: theme.typography.fontFamilies.body,
        color: safeColorFormat(theme.palette.text.primary),
        valign: 'middle',
        lineSpacing: theme.typography.lineHeights.normal * 100
      });
    } else if (config.layout === 'timeline') {
      // Timeline layout with connecting lines
      const stepNumber = index + 1;
      
      // Step number in circle
      slide.addShape('ellipse', {
        x: 0.7,
        y: y + 0.2,
        w: 0.4,
        h: 0.4,
        fill: { color: safeColorFormat(theme.palette.primary) },
        line: { width: 0 }
      });

      slide.addText(stepNumber.toString(), {
        x: 0.7,
        y: y + 0.2,
        w: 0.4,
        h: 0.4,
        fontSize: 14,
        color: safeColorFormat(theme.palette.text.inverse),
        align: 'center',
        valign: 'middle',
        bold: true
      });

      // Connecting line (except for last item)
      if (index < config.content.length - 1) {
        slide.addShape('line', {
          x: 0.9,
          y: y + 0.6,
          w: 0,
          h: itemHeight + itemSpacing - 0.2,
          line: {
            color: safeColorFormat(theme.palette.borders.medium),
            width: 2
          }
        });
      }

      // Content text
      slide.addText(item, {
        x: 1.3,
        y: y + 0.1,
        w: 8,
        h: itemHeight - 0.2,
        fontSize: theme.typography.fontSizes.body,
        fontFace: theme.typography.fontFamilies.body,
        color: safeColorFormat(theme.palette.text.primary),
        valign: 'middle',
        lineSpacing: theme.typography.lineHeights.normal * 100
      });
    } else {
      // Standard bullet layout with modern styling
      const bulletColor = config.accentColor || theme.palette.primary;
      
      // Modern bullet point
      slide.addShape('rect', {
        x: 0.7,
        y: y + 0.3,
        w: 0.15,
        h: 0.15,
        fill: { color: safeColorFormat(bulletColor) },
        line: { width: 0 },
        rectRadius: 0.02
      });

      slide.addText(item, {
        x: 1,
        y: y + 0.1,
        w: 8.5,
        h: itemHeight - 0.2,
        fontSize: theme.typography.fontSizes.body,
        fontFace: theme.typography.fontFamilies.body,
        color: safeColorFormat(theme.palette.text.primary),
        valign: 'middle',
        lineSpacing: theme.typography.lineHeights.normal * 100
      });
    }
  });
}

/**
 * Modern metrics dashboard slide
 */
export function createModernMetricsSlide(
  slide: any,
  config: {
    title: string;
    metrics: Array<{
      value: string;
      label: string;
      trend?: 'up' | 'down' | 'neutral';
      trendValue?: string;
      color?: string;
    }>;
    layout?: 'grid' | 'row';
  },
  theme: ModernTheme
): void {
  // Title
  slide.addText(config.title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: theme.typography.fontSizes.h1,
    fontFace: theme.typography.fontFamilies.heading,
    color: safeColorFormat(theme.palette.text.primary),
    bold: true
  });

  const metricsPerRow = config.layout === 'row' ? config.metrics.length : Math.min(4, config.metrics.length);
  const cardWidth = (9 - (metricsPerRow - 1) * 0.2) / metricsPerRow;
  const cardHeight = 1.5;
  const startY = 1.8;

  config.metrics.forEach((metric, index) => {
    const row = Math.floor(index / metricsPerRow);
    const col = index % metricsPerRow;
    const x = 0.5 + col * (cardWidth + 0.2);
    const y = startY + row * (cardHeight + 0.3);

    // Metric card background
    const cardBg = createModernCardBackground(x, y, cardWidth, cardHeight, theme, 'elevated');
    slide.addShape('rect', cardBg);

    // Metric value
    slide.addText(metric.value, {
      x: x + 0.1,
      y: y + 0.2,
      w: cardWidth - 0.2,
      h: 0.6,
      fontSize: theme.typography.fontSizes.h2,
      fontFace: theme.typography.fontFamilies.heading,
      color: safeColorFormat(metric.color || theme.palette.primary),
      align: 'center',
      valign: 'middle',
      bold: true
    });

    // Metric label
    slide.addText(metric.label, {
      x: x + 0.1,
      y: y + 0.8,
      w: cardWidth - 0.2,
      h: 0.4,
      fontSize: theme.typography.fontSizes.small,
      fontFace: theme.typography.fontFamilies.body,
      color: safeColorFormat(theme.palette.text.secondary),
      align: 'center',
      valign: 'middle'
    });

    // Trend indicator
    if (metric.trend && metric.trendValue) {
      const trendColor = metric.trend === 'up' ? theme.palette.semantic.success :
                        metric.trend === 'down' ? theme.palette.semantic.error :
                        theme.palette.text.muted;

      const trendSymbol = metric.trend === 'up' ? '↗' : 
                         metric.trend === 'down' ? '↘' : '→';

      slide.addText(`${trendSymbol} ${metric.trendValue}`, {
        x: x + 0.1,
        y: y + 1.2,
        w: cardWidth - 0.2,
        h: 0.25,
        fontSize: theme.typography.fontSizes.tiny,
        fontFace: theme.typography.fontFamilies.body,
        color: safeColorFormat(trendColor),
        align: 'center',
        valign: 'middle',
        bold: true
      });
    }
  });
}

/**
 * Create advanced hero slide with modern components
 */
export function createAdvancedHeroSlide(
  slide: any,
  config: {
    title: string;
    subtitle?: string;
    callToAction?: string;
    backgroundStyle?: 'gradient' | 'pattern' | 'minimal';
  },
  theme: ModernTheme
): void {
  createHeroSection(slide, config, theme);
}

/**
 * Create feature showcase slide
 */
export function createFeatureShowcaseSlide(
  slide: any,
  config: {
    title: string;
    features: Array<{
      icon?: string;
      title: string;
      description: string;
      color?: string;
    }>;
    layout?: 'grid' | 'row';
  },
  theme: ModernTheme
): void {
  createFeatureCallouts(slide, config, theme);
}

/**
 * Create testimonial slide
 */
export function createTestimonialSlide(
  slide: any,
  config: {
    title: string;
    quote: string;
    author: string;
    role?: string;
    company?: string;
    avatar?: string;
  },
  theme: ModernTheme
): void {
  createTestimonialCard(slide, config, theme);
}

/**
 * Create data visualization slide
 */
export function createDataVisualizationSlide(
  slide: any,
  config: {
    title: string;
    data: Array<{
      label: string;
      value: number;
      color?: string;
      trend?: 'up' | 'down' | 'neutral';
    }>;
    visualType?: 'bars' | 'progress' | 'cards';
  },
  theme: ModernTheme
): void {
  createDataVisualization(slide, config, theme);
}
