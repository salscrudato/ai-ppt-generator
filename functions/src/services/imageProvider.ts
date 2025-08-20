/*
 * Image Provider Interface and DALL·E (cost-conscious) implementation
 * Minimal, pluggable design; returns base64 data URLs for pptxgenjs embedding.
 */

import OpenAI from 'openai';

export type ImageRequest = {
  prompt: string;
  aspectRatio?: '16:9' | '4:3';
  size?: 'small' | 'medium' | 'large';
  backgroundRemoval?: boolean; // stub
};

export type ImageResult = {
  dataUrl?: string; // base64 data URL
  url?: string;     // remote URL fallback
};

export interface ImageProvider {
  generateImage(req: ImageRequest, signal?: AbortSignal): Promise<ImageResult>;
}

function selectOpenAIImageSize(size: NonNullable<ImageRequest['size']>, aspect: NonNullable<ImageRequest['aspectRatio']>): '512x512' | '1024x1024' | '1536x1024' | '1024x1536' | '256x256' | '1792x1024' | '1024x1792' {
  if (aspect === '16:9') {
    // Choose the closest landscape ratio sizes
    if (size === 'small') return '1536x1024'; // lower cost than max, landscape
    if (size === 'medium') return '1792x1024';
    return '1792x1024';
  }
  // Square-ish fallback
  if (size === 'small') return '512x512';
  if (size === 'medium') return '1024x1024';
  return '1024x1024';
}

export class DalleCostConsciousProvider implements ImageProvider {
  private client: OpenAI;
  constructor(apiKey?: string) {
    this.client = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY });
  }

  async generateImage(req: ImageRequest, signal?: AbortSignal): Promise<ImageResult> {
    const prompt = req.prompt;
    const aspect = req.aspectRatio ?? '16:9';
    const size = req.size ?? 'medium';
    const openaiSize = selectOpenAIImageSize(size, aspect);

    // Use the Images API with size choices that keep costs down
    const response = await this.client.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: openaiSize,
      response_format: 'b64_json'
    }, { signal });

    const b64 = response.data?.[0]?.b64_json;
    if (b64) {
      return { dataUrl: `data:image/png;base64,${b64}` };
    }

    const url = response.data?.[0]?.url;
    if (url) return { url };

    throw new Error('No image returned from provider');
  }
}

export class NoopImageProvider implements ImageProvider {
  async generateImage(_req: ImageRequest): Promise<ImageResult> {
    return { url: 'https://picsum.photos/1280/720' };
  }
}

