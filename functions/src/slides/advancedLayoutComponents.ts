/**
 * Advanced Layout Components for Modern PowerPoint Generation
 *
 * Sophisticated layout components including hero sections, feature callouts,
 * testimonial cards, and modern data visualization elements.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { ModernTheme } from '../core/theme/modernThemes';
import { 
  createModernCardBackground, 
  createAccentElement, 
  createProgressBar, 
  createBadge,
  VISUAL_EFFECT_PRESETS,
  applyVisualEffects
} from '../core/theme/visualEffects';

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
 * Create a modern hero section with background elements
 */
export function createHeroSection(
  slide: any,
  config: {
    title: string;
    subtitle?: string;
    callToAction?: string;
    backgroundStyle?: 'gradient' | 'pattern' | 'minimal';
  },
  theme: ModernTheme
): void {
  // Background styling
  if (config.backgroundStyle === 'gradient') {
    const gradientBg = applyVisualEffects(
      { x: 0, y: 0, w: 10, h: 5.625 },
      VISUAL_EFFECT_PRESETS.HERO_GRADIENT,
      theme
    );
    slide.addShape('rect', gradientBg);
  } else if (config.backgroundStyle === 'pattern') {
    // Add decorative pattern elements
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 9;
      const y = Math.random() * 5;
      const size = 0.1 + Math.random() * 0.2;
      
      const patternElement = createAccentElement(x, y, size, size, theme, 'circle');
      patternElement.transparency = 90; // Very subtle
      slide.addShape('ellipse', patternElement);
    }
  }

  // Main title with enhanced typography
  slide.addText(config.title, {
    x: 1,
    y: 1.5,
    w: 8,
    h: 1.5,
    fontSize: theme.typography.fontSizes.display,
    fontFace: theme.typography.fontFamilies.heading,
    color: safeColorFormat(theme.palette.text.primary),
    align: 'center',
    valign: 'middle',
    bold: true,
    lineSpacing: theme.typography.lineHeights.tight * 100
  });

  // Subtitle
  if (config.subtitle) {
    slide.addText(config.subtitle, {
      x: 1.5,
      y: 3.2,
      w: 7,
      h: 0.8,
      fontSize: theme.typography.fontSizes.h3,
      fontFace: theme.typography.fontFamilies.body,
      color: safeColorFormat(theme.palette.text.secondary),
      align: 'center',
      valign: 'middle',
      lineSpacing: theme.typography.lineHeights.normal * 100
    });
  }

  // Call to action button
  if (config.callToAction) {
    const buttonBg = createModernCardBackground(3.5, 4.2, 3, 0.6, theme, 'elevated');
    buttonBg.fill = { color: safeColorFormat(theme.palette.primary) };
    slide.addShape('rect', buttonBg);

    slide.addText(config.callToAction, {
      x: 3.5,
      y: 4.2,
      w: 3,
      h: 0.6,
      fontSize: theme.typography.fontSizes.body,
      fontFace: theme.typography.fontFamilies.heading,
      color: safeColorFormat(theme.palette.text.inverse),
      align: 'center',
      valign: 'middle',
      bold: true
    });
  }
}

/**
 * Create feature callout cards
 */
export function createFeatureCallouts(
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
  // Title
  slide.addText(config.title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: theme.typography.fontSizes.h1,
    fontFace: theme.typography.fontFamilies.heading,
    color: safeColorFormat(theme.palette.text.primary),
    bold: true,
    align: 'center'
  });

  const featuresPerRow = config.layout === 'row' ? config.features.length : Math.min(3, config.features.length);
  const cardWidth = (9 - (featuresPerRow - 1) * 0.3) / featuresPerRow;
  const cardHeight = 2.5;
  const startY = 1.8;

  config.features.forEach((feature, index) => {
    const row = Math.floor(index / featuresPerRow);
    const col = index % featuresPerRow;
    const x = 0.5 + col * (cardWidth + 0.3);
    const y = startY + row * (cardHeight + 0.4);

    // Feature card background
    const cardBg = createModernCardBackground(x, y, cardWidth, cardHeight, theme, 'elevated');
    slide.addShape('rect', cardBg);

    // Icon area (if provided)
    if (feature.icon) {
      const iconBg = createAccentElement(x + 0.2, y + 0.2, 0.6, 0.6, theme, 'circle');
      iconBg.fill = { color: safeColorFormat(feature.color || theme.palette.accent) };
      slide.addShape('ellipse', iconBg);

      slide.addText(feature.icon, {
        x: x + 0.2,
        y: y + 0.2,
        w: 0.6,
        h: 0.6,
        fontSize: 24,
        color: safeColorFormat(theme.palette.text.inverse),
        align: 'center',
        valign: 'middle'
      });
    }

    // Feature title
    slide.addText(feature.title, {
      x: x + 0.1,
      y: y + (feature.icon ? 1.0 : 0.3),
      w: cardWidth - 0.2,
      h: 0.5,
      fontSize: theme.typography.fontSizes.h4,
      fontFace: theme.typography.fontFamilies.heading,
      color: safeColorFormat(theme.palette.text.primary),
      align: 'center',
      valign: 'middle',
      bold: true
    });

    // Feature description
    slide.addText(feature.description, {
      x: x + 0.1,
      y: y + (feature.icon ? 1.5 : 0.8),
      w: cardWidth - 0.2,
      h: cardHeight - (feature.icon ? 1.7 : 1.0),
      fontSize: theme.typography.fontSizes.small,
      fontFace: theme.typography.fontFamilies.body,
      color: safeColorFormat(theme.palette.text.secondary),
      align: 'center',
      valign: 'top',
      lineSpacing: theme.typography.lineHeights.relaxed * 100
    });
  });
}

/**
 * Create testimonial card
 */
export function createTestimonialCard(
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
  // Title
  slide.addText(config.title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: theme.typography.fontSizes.h1,
    fontFace: theme.typography.fontFamilies.heading,
    color: safeColorFormat(theme.palette.text.primary),
    bold: true,
    align: 'center'
  });

  // Main testimonial card
  const cardBg = createModernCardBackground(1.5, 1.8, 7, 3, theme, 'elevated');
  slide.addShape('rect', cardBg);

  // Quote marks
  slide.addText('"', {
    x: 1.8,
    y: 2.0,
    w: 0.5,
    h: 0.5,
    fontSize: 48,
    fontFace: theme.typography.fontFamilies.heading,
    color: safeColorFormat(theme.palette.accent),
    align: 'left',
    valign: 'top'
  });

  // Quote text
  slide.addText(config.quote, {
    x: 2.0,
    y: 2.3,
    w: 5.5,
    h: 1.5,
    fontSize: theme.typography.fontSizes.h3,
    fontFace: theme.typography.fontFamilies.body,
    color: safeColorFormat(theme.palette.text.primary),
    align: 'left',
    valign: 'top',
    lineSpacing: theme.typography.lineHeights.relaxed * 100,
    italic: true
  });

  // Author information
  const authorInfo = [
    config.author,
    config.role,
    config.company
  ].filter(Boolean).join(' • ');

  slide.addText(authorInfo, {
    x: 2.0,
    y: 4.0,
    w: 5.5,
    h: 0.5,
    fontSize: theme.typography.fontSizes.small,
    fontFace: theme.typography.fontFamilies.body,
    color: safeColorFormat(theme.palette.text.secondary),
    align: 'left',
    valign: 'middle',
    bold: true
  });

  // Avatar placeholder (if provided)
  if (config.avatar) {
    const avatarBg = createAccentElement(7.8, 4.0, 0.5, 0.5, theme, 'circle');
    avatarBg.fill = { color: safeColorFormat(theme.palette.surface) };
    slide.addShape('ellipse', avatarBg);
  }
}

/**
 * Create modern data visualization section
 */
export function createDataVisualization(
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
  // Title
  slide.addText(config.title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: theme.typography.fontSizes.h1,
    fontFace: theme.typography.fontFamilies.heading,
    color: safeColorFormat(theme.palette.text.primary),
    bold: true,
    align: 'center'
  });

  const startY = 1.8;
  const maxValue = Math.max(...config.data.map(d => d.value));

  config.data.forEach((item, index) => {
    const y = startY + index * 0.8;
    
    if (config.visualType === 'progress') {
      // Progress bar visualization
      const progressBars = createProgressBar(2, y + 0.2, 6, 0.3, (item.value / maxValue) * 100, theme);
      
      slide.addShape('rect', progressBars.background);
      slide.addShape('rect', progressBars.fill);
      
      // Label
      slide.addText(item.label, {
        x: 0.5,
        y: y,
        w: 1.4,
        h: 0.7,
        fontSize: theme.typography.fontSizes.small,
        fontFace: theme.typography.fontFamilies.body,
        color: safeColorFormat(theme.palette.text.primary),
        align: 'right',
        valign: 'middle'
      });
      
      // Value
      slide.addText(item.value.toString(), {
        x: 8.2,
        y: y,
        w: 1.3,
        h: 0.7,
        fontSize: theme.typography.fontSizes.body,
        fontFace: theme.typography.fontFamilies.heading,
        color: safeColorFormat(theme.palette.text.primary),
        align: 'left',
        valign: 'middle',
        bold: true
      });
    } else {
      // Card-based visualization
      const cardBg = createModernCardBackground(0.5, y, 9, 0.6, theme, 'subtle');
      slide.addShape('rect', cardBg);
      
      // Data point
      const barWidth = (item.value / maxValue) * 6;
      slide.addShape('rect', {
        x: 2.5,
        y: y + 0.1,
        w: barWidth,
        h: 0.4,
        fill: { color: safeColorFormat(item.color || theme.palette.primary) },
        line: { width: 0 },
        rectRadius: 0.05
      });
      
      // Label and value
      slide.addText(`${item.label}: ${item.value}`, {
        x: 0.7,
        y: y,
        w: 8.6,
        h: 0.6,
        fontSize: theme.typography.fontSizes.body,
        fontFace: theme.typography.fontFamilies.body,
        color: safeColorFormat(theme.palette.text.primary),
        align: 'left',
        valign: 'middle'
      });
    }
  });
}
