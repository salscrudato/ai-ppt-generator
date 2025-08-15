/**
 * Advanced Image Caching System
 * 
 * Efficient caching mechanism for processed images to avoid redundant processing
 * and improve performance with intelligent cache management and optimization.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import sharp from 'sharp';

/**
 * Cache configuration
 */
export interface CacheConfig {
  cacheDirectory: string;
  maxCacheSize: number; // in MB
  maxCacheAge: number;  // in hours
  compressionLevel: number; // 0-9
  enableMetrics: boolean;
  cleanupInterval: number; // in minutes
  enableDiskCache: boolean;
  enableMemoryCache: boolean;
  memoryLimit: number; // in MB
}

/**
 * Cache entry metadata
 */
export interface CacheEntry {
  key: string;
  buffer: Buffer;
  metadata: {
    originalSize: number;
    compressedSize: number;
    width: number;
    height: number;
    format: string;
    created: Date;
    lastAccessed: Date;
    accessCount: number;
    processingTime: number;
    enhancements: string[];
  };
  diskPath?: string;
}

/**
 * Cache metrics
 */
export interface CacheMetrics {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  averageProcessingTime: number;
  mostAccessedEntries: string[];
  oldestEntries: string[];
  cacheEfficiency: number;
}

/**
 * Cache operation result
 */
export interface CacheResult {
  hit: boolean;
  entry?: CacheEntry;
  key: string;
  source: 'memory' | 'disk' | 'miss';
}

/**
 * Advanced Image Cache Manager
 */
export class ImageCacheManager {
  private config: CacheConfig;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private metrics: CacheMetrics;
  private cleanupTimer?: NodeJS.Timeout;
  private currentMemoryUsage: number = 0;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      cacheDirectory: './cache/images',
      maxCacheSize: 500, // 500MB
      maxCacheAge: 24,   // 24 hours
      compressionLevel: 6,
      enableMetrics: true,
      cleanupInterval: 30, // 30 minutes
      enableDiskCache: true,
      enableMemoryCache: true,
      memoryLimit: 100, // 100MB
      ...config
    };

    this.metrics = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      averageProcessingTime: 0,
      mostAccessedEntries: [],
      oldestEntries: [],
      cacheEfficiency: 0
    };

    this.initialize();
  }

  /**
   * Initialize cache system
   */
  private async initialize(): Promise<void> {
    // Ensure cache directory exists
    if (this.config.enableDiskCache) {
      await this.ensureCacheDirectory();
      await this.loadExistingCache();
    }

    // Start cleanup timer
    if (this.config.cleanupInterval > 0) {
      this.startCleanupTimer();
    }

    console.log(`🗄️ Image cache initialized: ${this.config.cacheDirectory}`);
  }

  /**
   * Get cached image or return cache miss
   */
  async get(key: string): Promise<CacheResult> {
    const startTime = Date.now();

    // Check memory cache first
    if (this.config.enableMemoryCache && this.memoryCache.has(key)) {
      const entry = this.memoryCache.get(key)!;
      entry.metadata.lastAccessed = new Date();
      entry.metadata.accessCount++;
      
      this.updateMetrics('hit', Date.now() - startTime);
      
      return {
        hit: true,
        entry,
        key,
        source: 'memory'
      };
    }

    // Check disk cache
    if (this.config.enableDiskCache) {
      const diskEntry = await this.getDiskEntry(key);
      if (diskEntry) {
        // Load into memory cache if there's space
        if (this.hasMemorySpace(diskEntry.buffer.length)) {
          this.memoryCache.set(key, diskEntry);
          this.currentMemoryUsage += diskEntry.buffer.length;
        }

        diskEntry.metadata.lastAccessed = new Date();
        diskEntry.metadata.accessCount++;
        
        this.updateMetrics('hit', Date.now() - startTime);
        
        return {
          hit: true,
          entry: diskEntry,
          key,
          source: 'disk'
        };
      }
    }

    // Cache miss
    this.updateMetrics('miss', Date.now() - startTime);
    
    return {
      hit: false,
      key,
      source: 'miss'
    };
  }

  /**
   * Store processed image in cache
   */
  async set(
    key: string, 
    buffer: Buffer, 
    metadata: {
      originalSize: number;
      width: number;
      height: number;
      format: string;
      processingTime: number;
      enhancements: string[];
    }
  ): Promise<void> {
    const now = new Date();
    
    // Compress buffer if needed
    const compressedBuffer = await this.compressBuffer(buffer);
    
    const entry: CacheEntry = {
      key,
      buffer: compressedBuffer,
      metadata: {
        ...metadata,
        compressedSize: compressedBuffer.length,
        created: now,
        lastAccessed: now,
        accessCount: 1
      }
    };

    // Store in memory cache if there's space
    if (this.config.enableMemoryCache && this.hasMemorySpace(compressedBuffer.length)) {
      this.memoryCache.set(key, entry);
      this.currentMemoryUsage += compressedBuffer.length;
    }

    // Store in disk cache
    if (this.config.enableDiskCache) {
      await this.setDiskEntry(key, entry);
    }

    this.metrics.totalEntries++;
    this.metrics.totalSize += compressedBuffer.length;

    console.log(`💾 Cached image: ${key} (${Math.round(compressedBuffer.length / 1024)}KB)`);
  }

  /**
   * Generate cache key from image and processing parameters
   */
  generateKey(
    imageUrl: string, 
    processingParams: Record<string, any>
  ): string {
    const keyData = {
      url: imageUrl,
      params: processingParams,
      timestamp: Math.floor(Date.now() / (1000 * 60 * 60)) // Hour-based for cache invalidation
    };
    
    return createHash('sha256')
      .update(JSON.stringify(keyData))
      .digest('hex')
      .substring(0, 32);
  }

  /**
   * Clear expired cache entries
   */
  async cleanup(): Promise<void> {
    const now = Date.now();
    const maxAge = this.config.maxCacheAge * 60 * 60 * 1000; // Convert to milliseconds
    
    let removedCount = 0;
    let freedSpace = 0;

    // Cleanup memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.metadata.created.getTime() > maxAge) {
        freedSpace += entry.buffer.length;
        this.memoryCache.delete(key);
        removedCount++;
      }
    }

    // Cleanup disk cache
    if (this.config.enableDiskCache) {
      const diskCleanup = await this.cleanupDiskCache(maxAge);
      removedCount += diskCleanup.removedCount;
      freedSpace += diskCleanup.freedSpace;
    }

    this.currentMemoryUsage -= freedSpace;
    this.metrics.totalEntries -= removedCount;
    this.metrics.totalSize -= freedSpace;

    if (removedCount > 0) {
      console.log(`🧹 Cache cleanup: removed ${removedCount} entries, freed ${Math.round(freedSpace / 1024 / 1024)}MB`);
    }
  }

  /**
   * Get cache metrics and statistics
   */
  getMetrics(): CacheMetrics {
    // Update efficiency calculation
    const totalRequests = this.metrics.hitRate + this.metrics.missRate;
    this.metrics.cacheEfficiency = totalRequests > 0 ? (this.metrics.hitRate / totalRequests) * 100 : 0;

    // Update most accessed entries
    const sortedEntries = Array.from(this.memoryCache.entries())
      .sort(([,a], [,b]) => b.metadata.accessCount - a.metadata.accessCount)
      .slice(0, 5)
      .map(([key]) => key);
    
    this.metrics.mostAccessedEntries = sortedEntries;

    return { ...this.metrics };
  }

  /**
   * Optimize cache performance
   */
  async optimize(): Promise<void> {
    console.log('🔧 Optimizing image cache...');

    // Remove least recently used entries if memory is full
    if (this.currentMemoryUsage > this.config.memoryLimit * 1024 * 1024) {
      await this.evictLRU();
    }

    // Compress old entries
    await this.compressOldEntries();

    // Defragment disk cache
    if (this.config.enableDiskCache) {
      await this.defragmentDiskCache();
    }

    console.log('✅ Cache optimization complete');
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    this.currentMemoryUsage = 0;

    if (this.config.enableDiskCache) {
      await this.clearDiskCache();
    }

    this.metrics = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      averageProcessingTime: 0,
      mostAccessedEntries: [],
      oldestEntries: [],
      cacheEfficiency: 0
    };

    console.log('🗑️ Cache cleared');
  }

  /**
   * Ensure cache directory exists
   */
  private async ensureCacheDirectory(): Promise<void> {
    if (!fs.existsSync(this.config.cacheDirectory)) {
      await fs.promises.mkdir(this.config.cacheDirectory, { recursive: true });
    }
  }

  /**
   * Load existing cache entries from disk
   */
  private async loadExistingCache(): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.config.cacheDirectory);
      const cacheFiles = files.filter(file => file.endsWith('.cache'));

      for (const file of cacheFiles) {
        const key = path.basename(file, '.cache');
        const entry = await this.getDiskEntry(key);
        
        if (entry && this.hasMemorySpace(entry.buffer.length)) {
          this.memoryCache.set(key, entry);
          this.currentMemoryUsage += entry.buffer.length;
        }
      }

      console.log(`📂 Loaded ${cacheFiles.length} cache entries from disk`);
    } catch (error) {
      console.warn('⚠️ Failed to load existing cache:', error);
    }
  }

  /**
   * Get entry from disk cache
   */
  private async getDiskEntry(key: string): Promise<CacheEntry | null> {
    try {
      const cachePath = path.join(this.config.cacheDirectory, `${key}.cache`);
      const metadataPath = path.join(this.config.cacheDirectory, `${key}.meta`);

      if (!fs.existsSync(cachePath) || !fs.existsSync(metadataPath)) {
        return null;
      }

      const buffer = await fs.promises.readFile(cachePath);
      const metadataJson = await fs.promises.readFile(metadataPath, 'utf8');
      const metadata = JSON.parse(metadataJson);

      return {
        key,
        buffer,
        metadata: {
          ...metadata,
          created: new Date(metadata.created),
          lastAccessed: new Date(metadata.lastAccessed)
        },
        diskPath: cachePath
      };
    } catch (error) {
      console.warn(`⚠️ Failed to read cache entry ${key}:`, error);
      return null;
    }
  }

  /**
   * Store entry to disk cache
   */
  private async setDiskEntry(key: string, entry: CacheEntry): Promise<void> {
    try {
      const cachePath = path.join(this.config.cacheDirectory, `${key}.cache`);
      const metadataPath = path.join(this.config.cacheDirectory, `${key}.meta`);

      await fs.promises.writeFile(cachePath, entry.buffer);
      await fs.promises.writeFile(metadataPath, JSON.stringify(entry.metadata, null, 2));

      entry.diskPath = cachePath;
    } catch (error) {
      console.warn(`⚠️ Failed to write cache entry ${key}:`, error);
    }
  }

  /**
   * Compress buffer for storage
   */
  private async compressBuffer(buffer: Buffer): Promise<Buffer> {
    if (this.config.compressionLevel === 0) {
      return buffer;
    }

    try {
      // Use Sharp's PNG compression for lossless compression
      return await sharp(buffer)
        .png({ compressionLevel: this.config.compressionLevel })
        .toBuffer();
    } catch (error) {
      console.warn('⚠️ Failed to compress buffer, using original:', error);
      return buffer;
    }
  }

  /**
   * Check if there's enough memory space
   */
  private hasMemorySpace(bufferSize: number): boolean {
    const memoryLimitBytes = this.config.memoryLimit * 1024 * 1024;
    return this.currentMemoryUsage + bufferSize <= memoryLimitBytes;
  }

  /**
   * Update cache metrics
   */
  private updateMetrics(type: 'hit' | 'miss', responseTime: number): void {
    if (type === 'hit') {
      this.metrics.hitRate++;
    } else {
      this.metrics.missRate++;
    }

    // Update average processing time
    const totalRequests = this.metrics.hitRate + this.metrics.missRate;
    this.metrics.averageProcessingTime = 
      (this.metrics.averageProcessingTime * (totalRequests - 1) + responseTime) / totalRequests;
  }

  /**
   * Evict least recently used entries
   */
  private async evictLRU(): Promise<void> {
    const entries = Array.from(this.memoryCache.entries())
      .sort(([,a], [,b]) => a.metadata.lastAccessed.getTime() - b.metadata.lastAccessed.getTime());

    const targetSize = this.config.memoryLimit * 1024 * 1024 * 0.8; // 80% of limit
    
    while (this.currentMemoryUsage > targetSize && entries.length > 0) {
      const [key, entry] = entries.shift()!;
      this.currentMemoryUsage -= entry.buffer.length;
      this.memoryCache.delete(key);
    }
  }

  /**
   * Compress old entries to save space
   */
  private async compressOldEntries(): Promise<void> {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.metadata.created.getTime() < oneDayAgo && entry.metadata.accessCount < 3) {
        // Re-compress with higher compression
        const recompressed = await sharp(entry.buffer)
          .png({ compressionLevel: 9 })
          .toBuffer();
        
        if (recompressed.length < entry.buffer.length) {
          this.currentMemoryUsage -= entry.buffer.length - recompressed.length;
          entry.buffer = recompressed;
          entry.metadata.compressedSize = recompressed.length;
        }
      }
    }
  }

  /**
   * Cleanup disk cache
   */
  private async cleanupDiskCache(maxAge: number): Promise<{ removedCount: number; freedSpace: number }> {
    let removedCount = 0;
    let freedSpace = 0;

    try {
      const files = await fs.promises.readdir(this.config.cacheDirectory);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.config.cacheDirectory, file);
        const stats = await fs.promises.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          freedSpace += stats.size;
          await fs.promises.unlink(filePath);
          removedCount++;
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to cleanup disk cache:', error);
    }

    return { removedCount, freedSpace };
  }

  /**
   * Defragment disk cache
   */
  private async defragmentDiskCache(): Promise<void> {
    // This would implement disk cache defragmentation
    // For now, it's a placeholder
    console.log('🔧 Disk cache defragmentation (placeholder)');
  }

  /**
   * Clear disk cache
   */
  private async clearDiskCache(): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.config.cacheDirectory);
      
      for (const file of files) {
        const filePath = path.join(this.config.cacheDirectory, file);
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.warn('⚠️ Failed to clear disk cache:', error);
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup().catch(console.error);
    }, this.config.cleanupInterval * 60 * 1000);
  }

  /**
   * Stop cleanup timer
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}
