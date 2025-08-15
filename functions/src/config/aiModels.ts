/**
 * Enhanced AI Model Configuration for Testing vs Production (C-4: Model Configuration & Cost Guardrails)
 *
 * This file centralizes AI model configuration with comprehensive cost guardrails,
 * performance monitoring, and intelligent model selection for optimal cost-quality balance.
 *
 * @version 2.0.0
 * @author AI PowerPoint Generator Team
 */

// Enhanced environment detection with cost guardrails
const isProduction = process.env.NODE_ENV === 'production';
const isTestingMode = process.env.AI_TESTING_MODE === 'true' || !isProduction;
const costLimitEnabled = process.env.AI_COST_LIMIT_ENABLED === 'true';
const dailyCostLimit = parseFloat(process.env.AI_DAILY_COST_LIMIT || '10.00'); // Default $10/day limit

/**
 * Enhanced Text Generation Model Configuration (C-4: Model Configuration & Cost Guardrails)
 * Optimized for cost-quality balance with intelligent model selection
 */
export const TEXT_MODEL_CONFIG = {
  // Testing Mode: Ultra low-cost models for development and testing
  testing: {
    model: 'gpt-4o-mini' as const,
    fallbackModel: 'gpt-3.5-turbo' as const,
    temperature: 0.7,
    maxTokens: 1200, // Reduced for cost optimization
    maxRetries: 2,
    retryDelay: 500,
    timeoutMs: 15000, // Shorter timeout for faster feedback
    maxBackoffDelay: 3000,
    costPerToken: 0.00015, // GPT-4o Mini: $0.15 per 1M input tokens
    costPerOutputToken: 0.0006, // $0.60 per 1M output tokens
    maxDailyCost: 2.00, // $2 daily limit for testing
    costOptimization: {
      enableTokenLimiting: true,
      preferShorterResponses: true,
      enableCaching: true,
      batchRequests: false // Disabled for testing to get faster feedback
    }
  },

  // Production Mode: Balanced cost-quality for optimal results
  production: {
    model: 'gpt-4o-mini' as const,
    fallbackModel: 'gpt-4o' as const,
    temperature: 0.7,
    maxTokens: 2000,
    maxRetries: 3,
    retryDelay: 1000,
    timeoutMs: 30000,
    maxBackoffDelay: 10000,
    costPerToken: 0.00015, // GPT-4o Mini: $0.15 per 1M input tokens
    costPerOutputToken: 0.0006, // $0.60 per 1M output tokens
    maxDailyCost: 25.00, // $25 daily limit for production
    costOptimization: {
      enableTokenLimiting: true,
      preferShorterResponses: false, // Allow full responses in production
      enableCaching: true,
      batchRequests: true // Enable batching for efficiency
    }
  },

  // Premium Mode: High-quality models for critical presentations
  premium: {
    model: 'gpt-4o' as const,
    fallbackModel: 'gpt-4o-mini' as const,
    temperature: 0.7,
    maxTokens: 3000,
    maxRetries: 4,
    retryDelay: 1500,
    timeoutMs: 45000,
    maxBackoffDelay: 15000,
    costPerToken: 0.005, // GPT-4o: $5.00 per 1M input tokens
    costPerOutputToken: 0.015, // $15.00 per 1M output tokens
    maxDailyCost: 100.00, // $100 daily limit for premium
    costOptimization: {
      enableTokenLimiting: false, // No limits for premium
      preferShorterResponses: false,
      enableCaching: true,
      batchRequests: true
    }
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

/**
 * Enhanced cost tracking and guardrails (C-4: Model Configuration & Cost Guardrails)
 */

// In-memory cost tracking (in production, this would be stored in a database)
let dailyCostTracker = {
  date: new Date().toDateString(),
  totalCost: 0,
  requestCount: 0,
  lastReset: Date.now()
};

/**
 * Check if request is within cost limits
 */
export function checkCostLimits(estimatedCost: number): {
  allowed: boolean;
  reason?: string;
  currentDailyCost: number;
  dailyLimit: number;
} {
  const config = getTextModelConfig();
  const today = new Date().toDateString();

  // Reset daily tracker if it's a new day
  if (dailyCostTracker.date !== today) {
    dailyCostTracker = {
      date: today,
      totalCost: 0,
      requestCount: 0,
      lastReset: Date.now()
    };
  }

  const projectedDailyCost = dailyCostTracker.totalCost + estimatedCost;
  const dailyLimit = config.maxDailyCost;

  if (costLimitEnabled && projectedDailyCost > dailyLimit) {
    return {
      allowed: false,
      reason: `Daily cost limit exceeded. Current: $${dailyCostTracker.totalCost.toFixed(4)}, Estimated: $${estimatedCost.toFixed(4)}, Limit: $${dailyLimit.toFixed(2)}`,
      currentDailyCost: dailyCostTracker.totalCost,
      dailyLimit
    };
  }

  return {
    allowed: true,
    currentDailyCost: dailyCostTracker.totalCost,
    dailyLimit
  };
}

/**
 * Record actual cost after API call
 */
export function recordActualCost(actualCost: number, operation: string): void {
  const today = new Date().toDateString();

  // Reset if new day
  if (dailyCostTracker.date !== today) {
    dailyCostTracker = {
      date: today,
      totalCost: 0,
      requestCount: 0,
      lastReset: Date.now()
    };
  }

  dailyCostTracker.totalCost += actualCost;
  dailyCostTracker.requestCount += 1;

  console.log(`💰 Cost Recorded: $${actualCost.toFixed(4)} for ${operation}`);
  console.log(`📊 Daily Total: $${dailyCostTracker.totalCost.toFixed(4)} (${dailyCostTracker.requestCount} requests)`);

  // Warn if approaching limit
  const config = getTextModelConfig();
  const utilizationPercent = (dailyCostTracker.totalCost / config.maxDailyCost) * 100;

  if (utilizationPercent > 80) {
    console.warn(`⚠️ High cost utilization: ${utilizationPercent.toFixed(1)}% of daily limit`);
  }
}

/**
 * Get current cost statistics
 */
export function getCostStatistics(): {
  dailyCost: number;
  dailyLimit: number;
  requestCount: number;
  utilizationPercent: number;
  remainingBudget: number;
} {
  const config = getTextModelConfig();
  const utilizationPercent = (dailyCostTracker.totalCost / config.maxDailyCost) * 100;

  return {
    dailyCost: dailyCostTracker.totalCost,
    dailyLimit: config.maxDailyCost,
    requestCount: dailyCostTracker.requestCount,
    utilizationPercent,
    remainingBudget: config.maxDailyCost - dailyCostTracker.totalCost
  };
}

/**
 * Intelligent model selection based on cost and quality requirements
 */
export function selectOptimalModel(requirements: {
  qualityLevel: 'basic' | 'standard' | 'premium';
  maxCost?: number;
  urgency: 'low' | 'medium' | 'high';
}): keyof typeof TEXT_MODEL_CONFIG {
  const costStats = getCostStatistics();

  // If approaching daily limit, use testing mode
  if (costStats.utilizationPercent > 90) {
    console.log('🔄 Switching to testing mode due to cost limits');
    return 'testing';
  }

  // Select based on quality requirements and cost constraints
  if (requirements.qualityLevel === 'premium' && costStats.remainingBudget > 5.00) {
    return 'premium';
  } else if (requirements.qualityLevel === 'standard' || isProduction) {
    return 'production';
  } else {
    return 'testing';
  }
}

export default {
  getTextModelConfig,
  getImageModelConfig,
  estimateGenerationCost,
  logCostEstimate,
  enableProductionMode,
  enableTestingMode,
  getCurrentMode,
  checkCostLimits,
  recordActualCost,
  getCostStatistics,
  selectOptimalModel
};
