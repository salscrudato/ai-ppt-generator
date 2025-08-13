/**
 * AI Model Configuration for Testing vs Production
 * 
 * This file centralizes AI model configuration to easily switch between
 * low-cost testing models and high-quality production models.
 */

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isTestingMode = process.env.AI_TESTING_MODE === 'true' || !isProduction;

/**
 * Text Generation Model Configuration
 */
export const TEXT_MODEL_CONFIG = {
  // Testing Mode: Low-cost models for development
  testing: {
    model: 'gpt-3.5-turbo' as const,
    fallbackModel: 'gpt-3.5-turbo' as const,
    temperature: 0.7,
    maxTokens: 1500,
    maxRetries: 2,
    retryDelay: 500,
    timeoutMs: 20000,
    maxBackoffDelay: 5000,
    costPerToken: 0.0015 // Approximate cost per 1K tokens (USD)
  },
  
  // Production Mode: High-quality models for best results
  production: {
    model: 'gpt-4o' as const,
    fallbackModel: 'gpt-4' as const,
    temperature: 0.7,
    maxTokens: 2000,
    maxRetries: 3,
    retryDelay: 1000,
    timeoutMs: 30000,
    maxBackoffDelay: 10000,
    costPerToken: 0.03 // Approximate cost per 1K tokens (USD)
  }
};

/**
 * Image Generation Model Configuration
 */
export const IMAGE_MODEL_CONFIG = {
  // Testing Mode: DALL-E 2 for cost efficiency
  testing: {
    model: 'dall-e-2' as const,
    size: '512x512' as const,
    quality: 'standard' as const,
    promptSuffix: ', professional, clean design',
    costPerImage: 0.018 // USD per image
  },
  
  // Production Mode: DALL-E 3 for highest quality
  production: {
    model: 'dall-e-3' as const,
    size: '1024x1024' as const,
    quality: 'hd' as const,
    promptSuffix: ', professional, high-resolution, clean design, photorealistic',
    costPerImage: 0.080 // USD per image (HD quality)
  }
};

/**
 * Get current text model configuration
 */
export function getTextModelConfig() {
  const config = isTestingMode ? TEXT_MODEL_CONFIG.testing : TEXT_MODEL_CONFIG.production;
  
  console.log(`🤖 Text Generation Mode: ${isTestingMode ? 'TESTING' : 'PRODUCTION'}`);
  console.log(`   Model: ${config.model}`);
  console.log(`   Cost: ~$${config.costPerToken}/1K tokens`);
  
  return config;
}

/**
 * Get current image model configuration
 */
export function getImageModelConfig() {
  const config = isTestingMode ? IMAGE_MODEL_CONFIG.testing : IMAGE_MODEL_CONFIG.production;
  
  console.log(`🎨 Image Generation Mode: ${isTestingMode ? 'TESTING' : 'PRODUCTION'}`);
  console.log(`   Model: ${config.model}`);
  console.log(`   Size: ${config.size}`);
  console.log(`   Cost: ~$${config.costPerImage}/image`);
  
  return config;
}

/**
 * Estimate costs for a generation request
 */
export function estimateGenerationCost(options: {
  textTokens?: number;
  imageCount?: number;
}): { textCost: number; imageCost: number; totalCost: number } {
  const textConfig = getTextModelConfig();
  const imageConfig = getImageModelConfig();
  
  const textCost = (options.textTokens || 0) * (textConfig.costPerToken / 1000);
  const imageCost = (options.imageCount || 0) * imageConfig.costPerImage;
  const totalCost = textCost + imageCost;
  
  return { textCost, imageCost, totalCost };
}

/**
 * Log cost information for transparency
 */
export function logCostEstimate(options: {
  textTokens?: number;
  imageCount?: number;
  operation?: string;
}) {
  const costs = estimateGenerationCost(options);
  const operation = options.operation || 'Generation';
  
  console.log(`💰 ${operation} Cost Estimate:`);
  if (options.textTokens) {
    console.log(`   Text: ${options.textTokens} tokens → $${costs.textCost.toFixed(4)}`);
  }
  if (options.imageCount) {
    console.log(`   Images: ${options.imageCount} images → $${costs.imageCost.toFixed(4)}`);
  }
  console.log(`   Total: $${costs.totalCost.toFixed(4)}`);
  
  if (isTestingMode) {
    console.log(`   💡 Testing mode active - using low-cost models`);
  }
}

/**
 * Switch to production mode (for deployment)
 */
export function enableProductionMode() {
  process.env.AI_TESTING_MODE = 'false';
  console.log('🚀 Switched to PRODUCTION mode - using high-quality models');
}

/**
 * Switch to testing mode (for development)
 */
export function enableTestingMode() {
  process.env.AI_TESTING_MODE = 'true';
  console.log('🧪 Switched to TESTING mode - using low-cost models');
}

/**
 * Current mode status
 */
export function getCurrentMode(): 'testing' | 'production' {
  return isTestingMode ? 'testing' : 'production';
}

export default {
  getTextModelConfig,
  getImageModelConfig,
  estimateGenerationCost,
  logCostEstimate,
  enableProductionMode,
  enableTestingMode,
  getCurrentMode
};
