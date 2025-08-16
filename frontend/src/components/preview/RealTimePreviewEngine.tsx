/**
 * Real-Time Preview Engine
 * 
 * High-performance slide preview system with sub-200ms update times,
 * optimized rendering, and intelligent caching for smooth user experience.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { debounce } from 'lodash-es';
import type { SlideSpec, ModernTheme } from '../../types';

export interface PreviewEngineProps {
  slides: SlideSpec[];
  theme: ModernTheme;
  activeSlideIndex: number;
  onSlideChange: (index: number) => void;
  onSlideUpdate: (index: number, slide: SlideSpec) => void;
  className?: string;
}

export interface PreviewPerformanceMetrics {
  renderTime: number;
  updateTime: number;
  cacheHitRate: number;
  frameRate: number;
}

interface CachedSlideRender {
  slideId: string;
  themeId: string;
  element: React.ReactElement;
  timestamp: number;
  renderTime: number;
}

/**
 * Real-Time Preview Engine Component
 */
export function RealTimePreviewEngine({
  slides,
  theme,
  activeSlideIndex,
  onSlideChange,
  onSlideUpdate,
  className = ''
}: PreviewEngineProps) {
  const [renderCache, setRenderCache] = useState<Map<string, CachedSlideRender>>(new Map());
  const [performanceMetrics, setPerformanceMetrics] = useState<PreviewPerformanceMetrics>({
    renderTime: 0,
    updateTime: 0,
    cacheHitRate: 0,
    frameRate: 60
  });
  const [isRendering, setIsRendering] = useState(false);
  
  const renderStartTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const lastFrameTime = useRef<number>(performance.now());

  /**
   * Optimized slide renderer with intelligent caching
   */
  const renderSlide = useCallback((slide: SlideSpec, slideIndex: number): React.ReactElement => {
    const startTime = performance.now();
    const cacheKey = `${slide.title}-${theme.id}-${JSON.stringify(slide).slice(0, 100)}`;
    
    // Check cache first
    const cached = renderCache.get(cacheKey);
    if (cached && (startTime - cached.timestamp) < 5000) { // 5 second cache
      setPerformanceMetrics(prev => ({
        ...prev,
        cacheHitRate: prev.cacheHitRate * 0.9 + 0.1 // Moving average
      }));
      return cached.element;
    }

    // Render new slide
    const slideElement = (
      <OptimizedSlideRenderer
        key={`${slideIndex}-${cacheKey}`}
        slide={slide}
        theme={theme}
        isActive={slideIndex === activeSlideIndex}
        onUpdate={(updatedSlide) => onSlideUpdate(slideIndex, updatedSlide)}
      />
    );

    const renderTime = performance.now() - startTime;
    
    // Cache the result
    const cachedRender: CachedSlideRender = {
      slideId: slide.title || `slide-${slideIndex}`,
      themeId: theme.id,
      element: slideElement,
      timestamp: startTime,
      renderTime
    };
    
    setRenderCache(prev => {
      const newCache = new Map(prev);
      newCache.set(cacheKey, cachedRender);
      
      // Limit cache size to prevent memory issues
      if (newCache.size > 50) {
        const oldestKey = Array.from(newCache.keys())[0];
        newCache.delete(oldestKey);
      }
      
      return newCache;
    });

    setPerformanceMetrics(prev => ({
      ...prev,
      renderTime,
      cacheHitRate: prev.cacheHitRate * 0.9 // Cache miss
    }));

    return slideElement;
  }, [slides, theme, activeSlideIndex, renderCache, onSlideUpdate]);

  /**
   * Debounced update handler for smooth performance
   */
  const debouncedUpdate = useMemo(
    () => debounce((updatedSlides: SlideSpec[]) => {
      const updateStartTime = performance.now();
      setIsRendering(true);
      
      // Clear relevant cache entries
      setRenderCache(prev => {
        const newCache = new Map(prev);
        updatedSlides.forEach((slide, index) => {
          const cacheKey = `${slide.title}-${theme.id}-${JSON.stringify(slide).slice(0, 100)}`;
          newCache.delete(cacheKey);
        });
        return newCache;
      });
      
      const updateTime = performance.now() - updateStartTime;
      setPerformanceMetrics(prev => ({
        ...prev,
        updateTime
      }));
      
      setIsRendering(false);
    }, 50), // 50ms debounce for sub-200ms total response
    [theme]
  );

  /**
   * Performance monitoring
   */
  useEffect(() => {
    const measureFrameRate = () => {
      const now = performance.now();
      const deltaTime = now - lastFrameTime.current;
      lastFrameTime.current = now;
      frameCount.current++;
      
      if (frameCount.current % 60 === 0) { // Update every 60 frames
        const fps = 1000 / deltaTime;
        setPerformanceMetrics(prev => ({
          ...prev,
          frameRate: Math.round(fps)
        }));
      }
      
      requestAnimationFrame(measureFrameRate);
    };
    
    const animationId = requestAnimationFrame(measureFrameRate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  /**
   * Trigger updates when slides change
   */
  useEffect(() => {
    debouncedUpdate(slides);
  }, [slides, debouncedUpdate]);

  /**
   * Preload adjacent slides for smooth navigation
   */
  const preloadAdjacentSlides = useCallback(() => {
    const preloadIndices = [
      Math.max(0, activeSlideIndex - 1),
      Math.min(slides.length - 1, activeSlideIndex + 1)
    ];
    
    preloadIndices.forEach(index => {
      if (index !== activeSlideIndex && slides[index]) {
        renderSlide(slides[index], index);
      }
    });
  }, [activeSlideIndex, slides, renderSlide]);

  useEffect(() => {
    preloadAdjacentSlides();
  }, [preloadAdjacentSlides]);

  return (
    <div className={`real-time-preview-engine ${className}`}>
      {/* Performance indicator */}
      <div className="preview-performance-indicator">
        <div className={`performance-status ${performanceMetrics.renderTime < 200 ? 'good' : 'warning'}`}>
          <span className="render-time">{Math.round(performanceMetrics.renderTime)}ms</span>
          <span className="cache-rate">{Math.round(performanceMetrics.cacheHitRate * 100)}% cached</span>
          <span className="frame-rate">{performanceMetrics.frameRate}fps</span>
        </div>
      </div>

      {/* Slide preview container */}
      <div className="slides-preview-container">
        {slides.map((slide, index) => (
          <div
            key={`slide-${index}`}
            className={`slide-preview-wrapper ${index === activeSlideIndex ? 'active' : ''}`}
            onClick={() => onSlideChange(index)}
          >
            {renderSlide(slide, index)}
          </div>
        ))}
      </div>

      {/* Rendering indicator */}
      {isRendering && (
        <div className="rendering-indicator">
          <div className="spinner" />
          <span>Updating preview...</span>
        </div>
      )}
    </div>
  );
}

/**
 * Optimized Slide Renderer Component
 */
interface OptimizedSlideRendererProps {
  slide: SlideSpec;
  theme: ModernTheme;
  isActive: boolean;
  onUpdate: (slide: SlideSpec) => void;
}

const OptimizedSlideRenderer = React.memo(function OptimizedSlideRenderer({
  slide,
  theme,
  isActive,
  onUpdate
}: OptimizedSlideRendererProps) {
  const slideRef = useRef<HTMLDivElement>(null);

  /**
   * Optimized layout rendering based on slide type
   */
  const renderSlideContent = useMemo(() => {
    switch (slide.layout) {
      case 'title':
        return <TitleSlidePreview slide={slide} theme={theme} />;
      case 'title-bullets':
        return <BulletSlidePreview slide={slide} theme={theme} />;
      case 'two-column':
        return <TwoColumnSlidePreview slide={slide} theme={theme} />;
      case 'timeline':
        return <TimelineSlidePreview slide={slide} theme={theme} />;
      case 'chart':
        return <ChartSlidePreview slide={slide} theme={theme} />;
      case 'quote':
        return <QuoteSlidePreview slide={slide} theme={theme} />;
      default:
        return <MixedContentSlidePreview slide={slide} theme={theme} />;
    }
  }, [slide, theme]);

  return (
    <div
      ref={slideRef}
      className={`optimized-slide-renderer ${slide.layout} ${isActive ? 'active' : ''}`}
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text.primary,
        fontFamily: theme.typography.bodyFont,
        aspectRatio: '16/9',
        width: '100%',
        maxWidth: '400px',
        border: `2px solid ${isActive ? theme.colors.primary : 'transparent'}`,
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        transform: isActive ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isActive 
          ? `0 8px 32px ${theme.colors.primary}20` 
          : '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      {renderSlideContent}
    </div>
  );
});

/**
 * Individual slide preview components (optimized for performance)
 */
const TitleSlidePreview = React.memo(({ slide, theme }: { slide: SlideSpec; theme: ModernTheme }) => (
  <div className="title-slide-preview" style={{ padding: '20px', textAlign: 'center' }}>
    <h1 style={{ 
      fontSize: '24px', 
      fontWeight: 'bold', 
      color: theme.colors.primary,
      marginBottom: '16px',
      lineHeight: '1.2'
    }}>
      {slide.title}
    </h1>
    {slide.paragraph && (
      <p style={{ 
        fontSize: '14px', 
        color: theme.colors.text.secondary,
        lineHeight: '1.4'
      }}>
        {slide.paragraph}
      </p>
    )}
  </div>
));

const BulletSlidePreview = React.memo(({ slide, theme }: { slide: SlideSpec; theme: ModernTheme }) => (
  <div className="bullet-slide-preview" style={{ padding: '16px' }}>
    <h2 style={{ 
      fontSize: '18px', 
      fontWeight: 'bold', 
      color: theme.colors.text.primary,
      marginBottom: '12px'
    }}>
      {slide.title}
    </h2>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {slide.bullets?.slice(0, 5).map((bullet, index) => (
        <li key={index} style={{ 
          fontSize: '12px', 
          color: theme.colors.text.primary,
          marginBottom: '6px',
          paddingLeft: '16px',
          position: 'relative'
        }}>
          <span style={{
            position: 'absolute',
            left: '0',
            top: '6px',
            width: '4px',
            height: '4px',
            backgroundColor: theme.colors.primary,
            borderRadius: '50%'
          }} />
          {bullet.length > 60 ? `${bullet.slice(0, 57)}...` : bullet}
        </li>
      ))}
    </ul>
  </div>
));

const TwoColumnSlidePreview = React.memo(({ slide, theme }: { slide: SlideSpec; theme: ModernTheme }) => (
  <div className="two-column-slide-preview" style={{ padding: '16px' }}>
    <h2 style={{ 
      fontSize: '16px', 
      fontWeight: 'bold', 
      color: theme.colors.text.primary,
      marginBottom: '12px'
    }}>
      {slide.title}
    </h2>
    <div style={{ display: 'flex', gap: '12px' }}>
      <div style={{ flex: 1 }}>
        {slide.left?.bullets?.slice(0, 3).map((bullet, index) => (
          <div key={index} style={{ 
            fontSize: '10px', 
            color: theme.colors.text.primary,
            marginBottom: '4px'
          }}>
            • {bullet.length > 40 ? `${bullet.slice(0, 37)}...` : bullet}
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }}>
        {slide.right?.bullets?.slice(0, 3).map((bullet, index) => (
          <div key={index} style={{ 
            fontSize: '10px', 
            color: theme.colors.text.primary,
            marginBottom: '4px'
          }}>
            • {bullet.length > 40 ? `${bullet.slice(0, 37)}...` : bullet}
          </div>
        ))}
      </div>
    </div>
  </div>
));

const TimelineSlidePreview = React.memo(({ slide, theme }: { slide: SlideSpec; theme: ModernTheme }) => (
  <div className="timeline-slide-preview" style={{ padding: '16px' }}>
    <h2 style={{ 
      fontSize: '16px', 
      fontWeight: 'bold', 
      color: theme.colors.text.primary,
      marginBottom: '12px'
    }}>
      {slide.title}
    </h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {slide.timeline?.slice(0, 3).map((item, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: theme.colors.primary,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {index + 1}
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 'bold', color: theme.colors.text.primary }}>
              {item.title}
            </div>
            <div style={{ fontSize: '8px', color: theme.colors.text.secondary }}>
              {item.description?.slice(0, 30)}...
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
));

const ChartSlidePreview = React.memo(({ slide, theme }: { slide: SlideSpec; theme: ModernTheme }) => (
  <div className="chart-slide-preview" style={{ padding: '16px' }}>
    <h2 style={{ 
      fontSize: '16px', 
      fontWeight: 'bold', 
      color: theme.colors.text.primary,
      marginBottom: '12px'
    }}>
      {slide.title}
    </h2>
    <div style={{
      width: '100%',
      height: '120px',
      backgroundColor: theme.colors.surface,
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `1px solid ${theme.colors.borders.light}`
    }}>
      <div style={{ textAlign: 'center', color: theme.colors.text.secondary }}>
        <div style={{ fontSize: '24px', marginBottom: '4px' }}>📊</div>
        <div style={{ fontSize: '10px' }}>Chart Preview</div>
      </div>
    </div>
  </div>
));

const QuoteSlidePreview = React.memo(({ slide, theme }: { slide: SlideSpec; theme: ModernTheme }) => (
  <div className="quote-slide-preview" style={{ padding: '20px', textAlign: 'center' }}>
    <h2 style={{ 
      fontSize: '16px', 
      fontWeight: 'bold', 
      color: theme.colors.text.primary,
      marginBottom: '16px'
    }}>
      {slide.title}
    </h2>
    {slide.quote && (
      <blockquote style={{
        fontSize: '14px',
        fontStyle: 'italic',
        color: theme.colors.text.primary,
        borderLeft: `3px solid ${theme.colors.primary}`,
        paddingLeft: '12px',
        margin: '0'
      }}>
        "{slide.quote.text}"
        <footer style={{ 
          fontSize: '10px', 
          color: theme.colors.text.secondary,
          marginTop: '8px'
        }}>
          — {slide.quote.author}
        </footer>
      </blockquote>
    )}
  </div>
));

const MixedContentSlidePreview = React.memo(({ slide, theme }: { slide: SlideSpec; theme: ModernTheme }) => (
  <div className="mixed-content-slide-preview" style={{ padding: '16px' }}>
    <h2 style={{ 
      fontSize: '16px', 
      fontWeight: 'bold', 
      color: theme.colors.text.primary,
      marginBottom: '12px'
    }}>
      {slide.title}
    </h2>
    <div style={{ fontSize: '10px', color: theme.colors.text.secondary }}>
      Mixed content layout with multiple elements
    </div>
  </div>
));

export default RealTimePreviewEngine;
