/**
 * Advanced Layout Components for Professional PowerPoint Generation
 * 
 * Provides sophisticated layout components including callout boxes, feature cards,
 * testimonial layouts, and modern slide templates for professional presentations.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import pptxgen from 'pptxgenjs';
import { ProfessionalTheme } from '../../professionalThemes';
import { SLIDE_DIMENSIONS, TYPOGRAPHY_CONSTANTS } from '../../constants/layoutConstants';
import { createShadowEffect, SHADOW_PRESETS } from './visualEffects';
import { createTextStyle, textStyleToPptOptions } from './enhancedTypography';

/**
 * Callout box configuration
 */
export interface CalloutConfig {
  type: 'info' | 'warning' | 'success' | 'error' | 'tip';
  title?: string;
  content: string;
  icon?: string;
  position: { x: number; y: number; w: number; h: number };
}

/**
 * Feature card configuration
 */
export interface FeatureCardConfig {
  title: string;
  description: string;
  icon?: string;
  features?: string[];
  position: { x: number; y: number; w: number; h: number };
}

/**
 * Testimonial configuration
 */
export interface TestimonialConfig {
  quote: string;
  author: string;
  title?: string;
  company?: string;
  avatar?: string;
  position: { x: number; y: number; w: number; h: number };
}

/**
 * Process step configuration
 */
export interface ProcessStepConfig {
  steps: Array<{
    number: number;
    title: string;
    description: string;
  }>;
  layout: 'horizontal' | 'vertical' | 'circular';
  position: { x: number; y: number; w: number; h: number };
}

/**
 * Create professional callout box
 */
export function createCalloutBox(
  slide: pptxgen.Slide,
  config: CalloutConfig,
  theme: ProfessionalTheme
): void {
  try {
    const { x, y, w, h } = config.position;
    
    // Get callout colors based on type
    const calloutColors = getCalloutColors(config.type, theme);
    
    // Background with border
    slide.addShape('rect', {
      x, y, w, h,
      fill: { color: calloutColors.background },
      line: {
        color: calloutColors.border,
        width: 2
      },
      rectRadius: 0.1,
      shadow: createShadowEffect(SHADOW_PRESETS.CARD_SUBTLE)
    });
    
    // Left accent bar
    slide.addShape('rect', {
      x, y,
      w: 0.1, h,
      fill: { color: calloutColors.accent },
      line: { width: 0 }
    });
    
    let contentY = y + 0.15;
    const contentX = x + 0.25;
    const contentWidth = w - 0.4;
    
    // Title if provided
    if (config.title) {
      const titleStyle = createTextStyle('subheading', undefined, {
        color: calloutColors.text,
        contentLength: config.title.length
      });
      
      slide.addText(config.title, {
        x: contentX,
        y: contentY,
        w: contentWidth,
        h: 0.4,
        ...textStyleToPptOptions(titleStyle),
        bold: true
      });
      contentY += 0.5;
    }
    
    // Content
    const contentStyle = createTextStyle('body', undefined, {
      color: calloutColors.text,
      contentLength: config.content.length
    });
    
    slide.addText(config.content, {
      x: contentX,
      y: contentY,
      w: contentWidth,
      h: h - (contentY - y) - 0.15,
      ...textStyleToPptOptions(contentStyle),
      valign: 'top'
    });
    
    console.log(`✅ Callout box (${config.type}) created`);
  } catch (error) {
    console.warn('⚠️ Failed to create callout box:', error);
  }
}

/**
 * Create feature card component
 */
export function createFeatureCard(
  slide: pptxgen.Slide,
  config: FeatureCardConfig,
  theme: ProfessionalTheme
): void {
  try {
    const { x, y, w, h } = config.position;
    
    // Card background
    slide.addShape('rect', {
      x, y, w, h,
      fill: { color: theme.colors.surface.replace('#', '') },
      line: {
        color: theme.colors.borders.light.replace('#', ''),
        width: 1
      },
      rectRadius: 0.15,
      shadow: createShadowEffect(SHADOW_PRESETS.CARD_MEDIUM)
    });
    
    // Header accent
    slide.addShape('rect', {
      x, y,
      w, h: 0.1,
      fill: { color: theme.colors.primary.replace('#', '') },
      line: { width: 0 },
      rectRadius: 0.15
    });
    
    let contentY = y + 0.25;
    const contentX = x + 0.2;
    const contentWidth = w - 0.4;
    
    // Title
    const titleStyle = createTextStyle('heading', undefined, {
      color: theme.colors.text.primary,
      contentLength: config.title.length
    });
    
    slide.addText(config.title, {
      x: contentX,
      y: contentY,
      w: contentWidth,
      h: 0.5,
      ...textStyleToPptOptions(titleStyle),
      bold: true,
      align: 'center'
    });
    contentY += 0.6;
    
    // Description
    const descStyle = createTextStyle('body', undefined, {
      color: theme.colors.text.secondary,
      contentLength: config.description.length
    });
    
    slide.addText(config.description, {
      x: contentX,
      y: contentY,
      w: contentWidth,
      h: 0.8,
      ...textStyleToPptOptions(descStyle),
      align: 'center',
      valign: 'top'
    });
    contentY += 0.9;
    
    // Features list if provided
    if (config.features && config.features.length > 0) {
      config.features.forEach((feature, index) => {
        if (contentY + 0.3 < y + h - 0.1) {
          // Bullet point
          slide.addShape('ellipse', {
            x: contentX,
            y: contentY + 0.05,
            w: 0.08,
            h: 0.08,
            fill: { color: theme.colors.accent.replace('#', '') },
            line: { width: 0 }
          });
          
          // Feature text
          slide.addText(feature, {
            x: contentX + 0.15,
            y: contentY,
            w: contentWidth - 0.15,
            h: 0.25,
            fontSize: 11,
            color: theme.colors.text.primary.replace('#', ''),
            fontFace: 'Segoe UI'
          });
          contentY += 0.3;
        }
      });
    }
    
    console.log('✅ Feature card created');
  } catch (error) {
    console.warn('⚠️ Failed to create feature card:', error);
  }
}

/**
 * Create testimonial component
 */
export function createTestimonial(
  slide: pptxgen.Slide,
  config: TestimonialConfig,
  theme: ProfessionalTheme
): void {
  try {
    const { x, y, w, h } = config.position;
    
    // Background
    slide.addShape('rect', {
      x, y, w, h,
      fill: { color: theme.colors.background.replace('#', '') },
      line: {
        color: theme.colors.borders.medium.replace('#', ''),
        width: 1
      },
      rectRadius: 0.2,
      shadow: createShadowEffect(SHADOW_PRESETS.CARD_SUBTLE)
    });
    
    // Quote mark
    slide.addText('"', {
      x: x + 0.2,
      y: y + 0.1,
      w: 0.3,
      h: 0.4,
      fontSize: 36,
      color: theme.colors.accent.replace('#', ''),
      fontFace: 'Georgia',
      bold: true
    });
    
    // Quote text
    const quoteStyle = createTextStyle('body', undefined, {
      color: theme.colors.text.primary,
      contentLength: config.quote.length
    });
    
    slide.addText(config.quote, {
      x: x + 0.3,
      y: y + 0.3,
      w: w - 0.6,
      h: h * 0.6,
      ...textStyleToPptOptions(quoteStyle),
      italic: true,
      valign: 'top'
    });
    
    // Author info
    const authorY = y + h - 0.8;
    
    // Author name
    slide.addText(config.author, {
      x: x + 0.3,
      y: authorY,
      w: w - 0.6,
      h: 0.3,
      fontSize: 14,
      color: theme.colors.text.primary.replace('#', ''),
      fontFace: 'Segoe UI',
      bold: true
    });
    
    // Title and company
    if (config.title || config.company) {
      const subtitle = [config.title, config.company].filter(Boolean).join(', ');
      slide.addText(subtitle, {
        x: x + 0.3,
        y: authorY + 0.3,
        w: w - 0.6,
        h: 0.25,
        fontSize: 12,
        color: theme.colors.text.secondary.replace('#', ''),
        fontFace: 'Segoe UI'
      });
    }
    
    console.log('✅ Testimonial created');
  } catch (error) {
    console.warn('⚠️ Failed to create testimonial:', error);
  }
}

/**
 * Create process flow component
 */
export function createProcessFlow(
  slide: pptxgen.Slide,
  config: ProcessStepConfig,
  theme: ProfessionalTheme
): void {
  try {
    const { x, y, w, h } = config.position;
    const stepCount = config.steps.length;
    
    if (config.layout === 'horizontal') {
      const stepWidth = (w - (stepCount - 1) * 0.3) / stepCount;
      
      config.steps.forEach((step, index) => {
        const stepX = x + index * (stepWidth + 0.3);
        
        // Step circle
        slide.addShape('ellipse', {
          x: stepX + stepWidth / 2 - 0.25,
          y: y,
          w: 0.5,
          h: 0.5,
          fill: { color: theme.colors.primary.replace('#', '') },
          line: { width: 0 },
          shadow: createShadowEffect(SHADOW_PRESETS.CARD_SUBTLE)
        });
        
        // Step number
        slide.addText(step.number.toString(), {
          x: stepX + stepWidth / 2 - 0.25,
          y: y,
          w: 0.5,
          h: 0.5,
          fontSize: 16,
          color: theme.colors.text.inverse.replace('#', ''),
          fontFace: 'Segoe UI',
          bold: true,
          align: 'center',
          valign: 'middle'
        });
        
        // Arrow (except for last step)
        if (index < stepCount - 1) {
          slide.addShape('rightArrow', {
            x: stepX + stepWidth + 0.05,
            y: y + 0.15,
            w: 0.2,
            h: 0.2,
            fill: { color: theme.colors.accent.replace('#', '') },
            line: { width: 0 }
          });
        }
        
        // Step title
        slide.addText(step.title, {
          x: stepX,
          y: y + 0.7,
          w: stepWidth,
          h: 0.4,
          fontSize: 14,
          color: theme.colors.text.primary.replace('#', ''),
          fontFace: 'Segoe UI',
          bold: true,
          align: 'center'
        });
        
        // Step description
        slide.addText(step.description, {
          x: stepX,
          y: y + 1.1,
          w: stepWidth,
          h: h - 1.1,
          fontSize: 11,
          color: theme.colors.text.secondary.replace('#', ''),
          fontFace: 'Segoe UI',
          align: 'center',
          valign: 'top'
        });
      });
    }
    
    console.log('✅ Process flow created');
  } catch (error) {
    console.warn('⚠️ Failed to create process flow:', error);
  }
}

/**
 * Get callout colors based on type
 */
function getCalloutColors(type: CalloutConfig['type'], theme: ProfessionalTheme) {
  switch (type) {
    case 'info':
      return {
        background: theme.colors.semantic.info + '10',
        border: theme.colors.semantic.info,
        accent: theme.colors.semantic.info,
        text: theme.colors.text.primary
      };
    case 'warning':
      return {
        background: theme.colors.semantic.warning + '10',
        border: theme.colors.semantic.warning,
        accent: theme.colors.semantic.warning,
        text: theme.colors.text.primary
      };
    case 'success':
      return {
        background: theme.colors.semantic.success + '10',
        border: theme.colors.semantic.success,
        accent: theme.colors.semantic.success,
        text: theme.colors.text.primary
      };
    case 'error':
      return {
        background: theme.colors.semantic.error + '10',
        border: theme.colors.semantic.error,
        accent: theme.colors.semantic.error,
        text: theme.colors.text.primary
      };
    case 'tip':
    default:
      return {
        background: theme.colors.accent + '10',
        border: theme.colors.accent,
        accent: theme.colors.accent,
        text: theme.colors.text.primary
      };
  }
}
