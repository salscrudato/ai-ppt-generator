/**
 * Enhanced Image Integration System for Professional PowerPoint Generation
 * 
 * Provides sophisticated image placement, sizing, borders, shadows, and integration
 * with slide layouts for professional appearance and optimal visual impact.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import pptxgen from 'pptxgenjs';
import { ProfessionalTheme } from '../../professionalThemes';
import { SLIDE_DIMENSIONS } from '../../constants/layoutConstants';
import { createShadowEffect, SHADOW_PRESETS } from './visualEffects';

/**
 * Image style configuration
 */
export interface ImageStyleConfig {
  borderRadius: number;
  borderWidth: number;
  borderColor?: string;
  shadowIntensity: 'none' | 'subtle' | 'medium' | 'strong';
  aspectRatio: 'preserve' | '16:9' | '4:3' | '1:1' | 'custom';
  customAspectRatio?: { width: number; height: number };
  overlay?: {
    type: 'gradient' | 'color' | 'pattern';
    opacity: number;
    color?: string;
  };
  filter?: 'none' | 'grayscale' | 'sepia' | 'blur' | 'brightness';
  filterIntensity?: number;
}

/**
 * Image placement configuration
 */
export interface ImagePlacementConfig {
  position: { x: number; y: number; w: number; h: number };
  alignment: 'left' | 'center' | 'right' | 'fill';
  verticalAlignment: 'top' | 'middle' | 'bottom';
  margin: number;
  captionPosition?: 'top' | 'bottom' | 'overlay';
  caption?: string;
}

/**
 * Image gallery configuration
 */
export interface ImageGalleryConfig {
  images: Array<{
    src: string;
    caption?: string;
    title?: string;
  }>;
  layout: 'grid' | 'masonry' | 'carousel' | 'featured';
  columns: number;
  spacing: number;
  position: { x: number; y: number; w: number; h: number };
}

/**
 * Default image style configuration
 */
export const DEFAULT_IMAGE_STYLE: ImageStyleConfig = {
  borderRadius: 0.1,
  borderWidth: 0,
  shadowIntensity: 'subtle',
  aspectRatio: 'preserve',
  filter: 'none'
};

/**
 * Default image placement configuration
 */
export const DEFAULT_IMAGE_PLACEMENT: Omit<ImagePlacementConfig, 'position'> = {
  alignment: 'center',
  verticalAlignment: 'middle',
  margin: 0.1
};

/**
 * Add enhanced image with professional styling
 */
export function addEnhancedImage(
  slide: pptxgen.Slide,
  imageSrc: string,
  placement: ImagePlacementConfig,
  style: Partial<ImageStyleConfig> = {},
  theme: ProfessionalTheme
): void {
  try {
    const imageStyle = { ...DEFAULT_IMAGE_STYLE, ...style };
    const { x, y, w, h } = placement.position;
    
    // Calculate actual image dimensions based on alignment and aspect ratio
    const imageDimensions = calculateImageDimensions(w, h, imageStyle);
    const imagePosition = calculateImagePosition(x, y, w, h, imageDimensions, placement);
    
    // Add background/frame if needed
    if (imageStyle.borderWidth > 0 || imageStyle.shadowIntensity !== 'none') {
      addImageFrame(slide, imagePosition, imageDimensions, imageStyle, theme);
    }
    
    // Add the image
    const imageOptions: any = {
      x: imagePosition.x,
      y: imagePosition.y,
      w: imageDimensions.width,
      h: imageDimensions.height,
      rounding: imageStyle.borderRadius > 0
    };
    
    // Add shadow if specified
    if (imageStyle.shadowIntensity !== 'none') {
      const shadowPreset = {
        subtle: SHADOW_PRESETS.CARD_SUBTLE,
        medium: SHADOW_PRESETS.CARD_MEDIUM,
        strong: SHADOW_PRESETS.CARD_STRONG
      }[imageStyle.shadowIntensity];
      
      imageOptions.shadow = createShadowEffect(shadowPreset);
    }
    
    slide.addImage({
      path: imageSrc,
      ...imageOptions
    });
    
    // Add caption if provided
    if (placement.caption) {
      addImageCaption(slide, placement.caption, imagePosition, imageDimensions, placement, theme);
    }
    
    // Add overlay if specified
    if (imageStyle.overlay) {
      addImageOverlay(slide, imagePosition, imageDimensions, imageStyle.overlay, theme);
    }
    
    console.log('✅ Enhanced image added with professional styling');
  } catch (error) {
    console.warn('⚠️ Failed to add enhanced image:', error);
    // Fallback to basic image
    slide.addImage({
      path: imageSrc,
      x: placement.position.x,
      y: placement.position.y,
      w: placement.position.w,
      h: placement.position.h
    });
  }
}

/**
 * Create image gallery layout
 */
export function createImageGallery(
  slide: pptxgen.Slide,
  config: ImageGalleryConfig,
  theme: ProfessionalTheme
): void {
  try {
    const { x, y, w, h } = config.position;
    
    switch (config.layout) {
      case 'grid':
        createGridGallery(slide, config, theme);
        break;
      case 'featured':
        createFeaturedGallery(slide, config, theme);
        break;
      case 'carousel':
        createCarouselGallery(slide, config, theme);
        break;
      default:
        createGridGallery(slide, config, theme);
    }
    
    console.log(`✅ Image gallery (${config.layout}) created`);
  } catch (error) {
    console.warn('⚠️ Failed to create image gallery:', error);
  }
}

/**
 * Add image with text wrap
 */
export function addImageWithTextWrap(
  slide: pptxgen.Slide,
  imageSrc: string,
  text: string,
  config: {
    imagePosition: 'left' | 'right';
    imageSize: { w: number; h: number };
    containerPosition: { x: number; y: number; w: number; h: number };
    gap: number;
  },
  theme: ProfessionalTheme
): void {
  try {
    const { x, y, w, h } = config.containerPosition;
    const { w: imgW, h: imgH } = config.imageSize;
    
    let imageX: number, textX: number, textW: number;
    
    if (config.imagePosition === 'left') {
      imageX = x;
      textX = x + imgW + config.gap;
      textW = w - imgW - config.gap;
    } else {
      imageX = x + w - imgW;
      textX = x;
      textW = w - imgW - config.gap;
    }
    
    // Add image with enhanced styling
    addEnhancedImage(
      slide,
      imageSrc,
      {
        position: { x: imageX, y: y, w: imgW, h: imgH },
        alignment: 'center',
        verticalAlignment: 'top',
        margin: 0
      },
      {
        borderRadius: 0.1,
        shadowIntensity: 'subtle'
      },
      theme
    );
    
    // Add text content
    slide.addText(text, {
      x: textX,
      y: y,
      w: textW,
      h: h,
      fontSize: 14,
      color: theme.colors.text.primary.replace('#', ''),
      fontFace: 'Segoe UI',
      valign: 'top'
    });
    
    console.log('✅ Image with text wrap created');
  } catch (error) {
    console.warn('⚠️ Failed to create image with text wrap:', error);
  }
}

/**
 * Calculate image dimensions based on style configuration
 */
function calculateImageDimensions(
  containerWidth: number,
  containerHeight: number,
  style: ImageStyleConfig
): { width: number; height: number } {
  let width = containerWidth;
  let height = containerHeight;
  
  if (style.aspectRatio !== 'preserve') {
    const aspectRatios = {
      '16:9': 16 / 9,
      '4:3': 4 / 3,
      '1:1': 1,
      'custom': style.customAspectRatio ? 
        style.customAspectRatio.width / style.customAspectRatio.height : 1
    };
    
    const targetRatio = aspectRatios[style.aspectRatio] || 1;
    const containerRatio = containerWidth / containerHeight;
    
    if (containerRatio > targetRatio) {
      // Container is wider than target ratio
      width = containerHeight * targetRatio;
    } else {
      // Container is taller than target ratio
      height = containerWidth / targetRatio;
    }
  }
  
  return { width, height };
}

/**
 * Calculate image position based on alignment
 */
function calculateImagePosition(
  containerX: number,
  containerY: number,
  containerWidth: number,
  containerHeight: number,
  imageDimensions: { width: number; height: number },
  placement: ImagePlacementConfig
): { x: number; y: number } {
  let x = containerX;
  let y = containerY;
  
  // Horizontal alignment
  switch (placement.alignment) {
    case 'center':
      x = containerX + (containerWidth - imageDimensions.width) / 2;
      break;
    case 'right':
      x = containerX + containerWidth - imageDimensions.width;
      break;
    case 'left':
    default:
      x = containerX;
      break;
  }
  
  // Vertical alignment
  switch (placement.verticalAlignment) {
    case 'middle':
      y = containerY + (containerHeight - imageDimensions.height) / 2;
      break;
    case 'bottom':
      y = containerY + containerHeight - imageDimensions.height;
      break;
    case 'top':
    default:
      y = containerY;
      break;
  }
  
  // Apply margin
  x += placement.margin;
  y += placement.margin;
  
  return { x, y };
}

/**
 * Add image frame/border
 */
function addImageFrame(
  slide: pptxgen.Slide,
  position: { x: number; y: number },
  dimensions: { width: number; height: number },
  style: ImageStyleConfig,
  theme: ProfessionalTheme
): void {
  const frameOptions: any = {
    x: position.x - style.borderWidth / 72,
    y: position.y - style.borderWidth / 72,
    w: dimensions.width + (style.borderWidth * 2) / 72,
    h: dimensions.height + (style.borderWidth * 2) / 72,
    fill: { color: 'FFFFFF' },
    rectRadius: style.borderRadius
  };
  
  if (style.borderWidth > 0) {
    frameOptions.line = {
      color: style.borderColor?.replace('#', '') || theme.colors.borders.medium.replace('#', ''),
      width: style.borderWidth
    };
  }
  
  if (style.shadowIntensity !== 'none') {
    const shadowPreset = {
      subtle: SHADOW_PRESETS.CARD_SUBTLE,
      medium: SHADOW_PRESETS.CARD_MEDIUM,
      strong: SHADOW_PRESETS.CARD_STRONG
    }[style.shadowIntensity];
    
    frameOptions.shadow = createShadowEffect(shadowPreset);
  }
  
  slide.addShape('rect', frameOptions);
}

/**
 * Add image caption
 */
function addImageCaption(
  slide: pptxgen.Slide,
  caption: string,
  imagePosition: { x: number; y: number },
  imageDimensions: { width: number; height: number },
  placement: ImagePlacementConfig,
  theme: ProfessionalTheme
): void {
  let captionY: number;
  let captionH = 0.4;
  
  switch (placement.captionPosition) {
    case 'top':
      captionY = imagePosition.y - captionH - 0.1;
      break;
    case 'overlay':
      captionY = imagePosition.y + imageDimensions.height - captionH - 0.1;
      // Add semi-transparent background for overlay
      slide.addShape('rect', {
        x: imagePosition.x,
        y: captionY - 0.05,
        w: imageDimensions.width,
        h: captionH + 0.1,
        fill: { color: '000000' },
        line: { width: 0 }
      } as any);
      break;
    case 'bottom':
    default:
      captionY = imagePosition.y + imageDimensions.height + 0.1;
      break;
  }
  
  slide.addText(caption, {
    x: imagePosition.x,
    y: captionY,
    w: imageDimensions.width,
    h: captionH,
    fontSize: 11,
    color: placement.captionPosition === 'overlay' ? 
      theme.colors.text.inverse.replace('#', '') : 
      theme.colors.text.secondary.replace('#', ''),
    fontFace: 'Segoe UI',
    align: 'center',
    italic: true
  });
}

/**
 * Add image overlay
 */
function addImageOverlay(
  slide: pptxgen.Slide,
  position: { x: number; y: number },
  dimensions: { width: number; height: number },
  overlay: NonNullable<ImageStyleConfig['overlay']>,
  theme: ProfessionalTheme
): void {
  const overlayOptions: any = {
    x: position.x,
    y: position.y,
    w: dimensions.width,
    h: dimensions.height,
    transparency: Math.round((1 - overlay.opacity) * 100),
    line: { width: 0 }
  };
  
  if (overlay.type === 'color') {
    overlayOptions.fill = { 
      color: overlay.color?.replace('#', '') || theme.colors.primary.replace('#', '') 
    };
  } else if (overlay.type === 'gradient') {
    overlayOptions.fill = {
      type: 'gradient',
      colors: [
        { color: theme.colors.primary.replace('#', ''), position: 0 },
        { color: theme.colors.accent.replace('#', ''), position: 100 }
      ],
      angle: 45
    };
  }
  
  slide.addShape('rect', overlayOptions);
}

/**
 * Create grid gallery layout
 */
function createGridGallery(
  slide: pptxgen.Slide,
  config: ImageGalleryConfig,
  theme: ProfessionalTheme
): void {
  const { x, y, w, h } = config.position;
  const { columns, spacing, images } = config;
  
  const rows = Math.ceil(images.length / columns);
  const cellWidth = (w - (columns - 1) * spacing) / columns;
  const cellHeight = (h - (rows - 1) * spacing) / rows;
  
  images.forEach((image, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    
    const cellX = x + col * (cellWidth + spacing);
    const cellY = y + row * (cellHeight + spacing);
    
    addEnhancedImage(
      slide,
      image.src,
      {
        position: { x: cellX, y: cellY, w: cellWidth, h: cellHeight },
        alignment: 'center',
        verticalAlignment: 'middle',
        margin: 0,
        caption: image.caption,
        captionPosition: 'bottom'
      },
      {
        borderRadius: 0.1,
        shadowIntensity: 'subtle',
        aspectRatio: '1:1'
      },
      theme
    );
  });
}

/**
 * Create featured gallery layout
 */
function createFeaturedGallery(
  slide: pptxgen.Slide,
  config: ImageGalleryConfig,
  theme: ProfessionalTheme
): void {
  const { x, y, w, h } = config.position;
  const { images } = config;
  
  if (images.length === 0) return;
  
  // Featured image (larger, left side)
  const featuredWidth = w * 0.6;
  const featuredHeight = h;
  
  addEnhancedImage(
    slide,
    images[0].src,
    {
      position: { x, y, w: featuredWidth, h: featuredHeight },
      alignment: 'center',
      verticalAlignment: 'middle',
      margin: 0,
      caption: images[0].caption,
      captionPosition: 'bottom'
    },
    {
      borderRadius: 0.15,
      shadowIntensity: 'medium',
      aspectRatio: '16:9'
    },
    theme
  );
  
  // Thumbnail images (right side)
  if (images.length > 1) {
    const thumbWidth = w * 0.35;
    const thumbHeight = (h - config.spacing) / Math.min(images.length - 1, 3);
    const thumbX = x + featuredWidth + config.spacing;
    
    images.slice(1, 4).forEach((image, index) => {
      const thumbY = y + index * (thumbHeight + config.spacing);
      
      addEnhancedImage(
        slide,
        image.src,
        {
          position: { x: thumbX, y: thumbY, w: thumbWidth, h: thumbHeight },
          alignment: 'center',
          verticalAlignment: 'middle',
          margin: 0
        },
        {
          borderRadius: 0.1,
          shadowIntensity: 'subtle',
          aspectRatio: '4:3'
        },
        theme
      );
    });
  }
}

/**
 * Create carousel gallery layout
 */
function createCarouselGallery(
  slide: pptxgen.Slide,
  config: ImageGalleryConfig,
  theme: ProfessionalTheme
): void {
  const { x, y, w, h } = config.position;
  const { images, spacing } = config;
  
  const imageWidth = (w - (images.length - 1) * spacing) / images.length;
  
  images.forEach((image, index) => {
    const imageX = x + index * (imageWidth + spacing);
    
    addEnhancedImage(
      slide,
      image.src,
      {
        position: { x: imageX, y, w: imageWidth, h },
        alignment: 'center',
        verticalAlignment: 'middle',
        margin: 0,
        caption: image.caption,
        captionPosition: 'bottom'
      },
      {
        borderRadius: 0.1,
        shadowIntensity: 'subtle',
        aspectRatio: '4:3'
      },
      theme
    );
  });
}
