/**
 * Common Utilities for AI PowerPoint Generator
 * 
 * Centralized utility functions to reduce code redundancy and improve maintainability.
 * This file contains frequently used helper functions across the application.
 * 
 * @version 3.2.0-enhanced
 * @author AI PowerPoint Generator Team
 */

/**
 * Safe color conversion utility
 * Ensures color values are valid for PowerPoint generation
 */
export function safeColor(color: string | undefined | null): string {
  if (!color || typeof color !== 'string') {
    return '#000000'; // Default to black
  }
  
  // Remove any whitespace
  color = color.trim();
  
  // If it's already a hex color, return it
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return color;
  }
  
  // If it's a 3-digit hex, expand it
  if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
    return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  }
  
  // Common color name mappings
  const colorMap: Record<string, string> = {
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#FF0000',
    'green': '#00FF00',
    'blue': '#0000FF',
    'yellow': '#FFFF00',
    'cyan': '#00FFFF',
    'magenta': '#FF00FF',
    'gray': '#808080',
    'grey': '#808080'
  };
  
  return colorMap[color.toLowerCase()] || '#000000';
}

/**
 * Generate unique ID for slides and components
 */
export function generateId(prefix: string = 'id'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Validate and sanitize text content
 */
export function sanitizeText(text: string | undefined | null): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s\-.,!?()]/g, '') // Remove special characters except basic punctuation
    .substring(0, 1000); // Limit length to prevent issues
}

/**
 * Format numbers for display in presentations
 */
export function formatNumber(value: number | string, options?: {
  decimals?: number;
  currency?: boolean;
  percentage?: boolean;
}): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return '0';
  }
  
  const opts = {
    decimals: 0,
    currency: false,
    percentage: false,
    ...options
  };
  
  let formatted = num.toFixed(opts.decimals);
  
  if (opts.percentage) {
    formatted += '%';
  }
  
  if (opts.currency) {
    formatted = '$' + formatted;
  }
  
  return formatted;
}

/**
 * Calculate optimal font size based on content length and container size
 */
export function calculateOptimalFontSize(
  text: string,
  containerWidth: number,
  containerHeight: number,
  minSize: number = 12,
  maxSize: number = 48
): number {
  const textLength = text.length;
  const area = containerWidth * containerHeight;
  
  // Base calculation on text density
  let fontSize = Math.sqrt(area / textLength) * 0.8;
  
  // Clamp to min/max bounds
  fontSize = Math.max(minSize, Math.min(maxSize, fontSize));
  
  return Math.round(fontSize);
}

/**
 * Extract numeric values from text for chart generation
 */
export function extractNumbers(text: string): number[] {
  const numbers: number[] = [];
  const regex = /\d+(?:\.\d+)?/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const num = parseFloat(match[0]);
    if (!isNaN(num)) {
      numbers.push(num);
    }
  }
  
  return numbers;
}

/**
 * Generate professional color palette based on a primary color
 */
export function generateColorPalette(primaryColor: string): string[] {
  // This is a simplified version - in a real implementation,
  // you might use color theory algorithms
  const base = safeColor(primaryColor);
  
  return [
    base,
    adjustColorBrightness(base, -20),
    adjustColorBrightness(base, 20),
    adjustColorBrightness(base, -40),
    adjustColorBrightness(base, 40),
    adjustColorBrightness(base, -60),
    adjustColorBrightness(base, 60)
  ];
}

/**
 * Adjust color brightness
 */
function adjustColorBrightness(color: string, percent: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const adjust = (c: number) => {
    const adjusted = Math.round(c * (100 + percent) / 100);
    return Math.max(0, Math.min(255, adjusted));
  };
  
  const newR = adjust(r).toString(16).padStart(2, '0');
  const newG = adjust(g).toString(16).padStart(2, '0');
  const newB = adjust(b).toString(16).padStart(2, '0');
  
  return `#${newR}${newG}${newB}`;
}

/**
 * Validate slide specification structure
 */
export function validateSlideSpec(spec: any): boolean {
  if (!spec || typeof spec !== 'object') {
    return false;
  }
  
  // Check required fields
  if (!spec.title || typeof spec.title !== 'string') {
    return false;
  }
  
  if (!spec.layout || typeof spec.layout !== 'string') {
    return false;
  }
  
  // Validate bullets if present
  if (spec.bullets && !Array.isArray(spec.bullets)) {
    return false;
  }
  
  return true;
}

/**
 * Deep clone object utility
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * Retry utility with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries - 1) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Performance timing utility
 */
export class PerformanceTimer {
  private startTime: number;
  private label: string;
  
  constructor(label: string) {
    this.label = label;
    this.startTime = Date.now();
  }
  
  end(): number {
    const duration = Date.now() - this.startTime;
    console.log(`⏱️ ${this.label}: ${duration}ms`);
    return duration;
  }
}

/**
 * Memory usage utility
 */
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} {
  const usage = process.memoryUsage();
  const used = Math.round(usage.heapUsed / 1024 / 1024);
  const total = Math.round(usage.heapTotal / 1024 / 1024);
  const percentage = Math.round((used / total) * 100);
  
  return { used, total, percentage };
}
