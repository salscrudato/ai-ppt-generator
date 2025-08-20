/*
 * Image Orchestrator to resolve imageUrl/data for slides when includeImages=true
 */

import type { SlideSpec } from '../schema';
import { DalleCostConsciousProvider, NoopImageProvider, type ImageProvider } from './imageProvider';

export type ImageOrchestratorOptions = {
  provider?: 'dalle' | 'noop';
  aspectRatio?: '16:9' | '4:3';
  size?: 'small' | 'medium' | 'large';
};

export async function resolveImagesForSlides(slides: SlideSpec[], opts: ImageOrchestratorOptions = {}): Promise<SlideSpec[]> {
  const provider: ImageProvider = (() => {
    if (opts.provider === 'noop') return new NoopImageProvider();
    return new DalleCostConsciousProvider();
  })();

  const aspect = opts.aspectRatio ?? '16:9';
  const size = opts.size ?? 'medium';

  const resolved: SlideSpec[] = [];
  for (const slide of slides) {
    if ((slide.layout === 'image-left' || slide.layout === 'image-right' || slide.layout === 'image-full') && !slide.imageUrl) {
      const prompt = slide.title + ' ' + (slide.paragraph || slide.bullets?.join(' ') || '');
      try {
        const img = await provider.generateImage({ prompt, aspectRatio: aspect, size });
        if (img.dataUrl) {
          // We’ll attach base64 via a non-schema field used only by ppt generator
          (slide as any).generatedImageData = img.dataUrl;
          slide.imageUrl = undefined as any; // keep schema clean but mark presence
          slide.altText = slide.altText || 'AI-generated image';
        } else if (img.url) {
          slide.imageUrl = img.url;
          slide.altText = slide.altText || 'AI-generated image';
        }
      } catch (e) {
        // Leave slide unchanged on failure
      }
    }
    resolved.push(slide);
  }
  return resolved;
}

