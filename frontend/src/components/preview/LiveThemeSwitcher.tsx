/**
 * Live Theme Switching System
 * 
 * Instant visual feedback system for theme changes with smooth transitions,
 * optimized performance, and seamless user experience.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ModernTheme } from '../../types';

export interface LiveThemeSwitcherProps {
  themes: ModernTheme[];
  currentTheme: ModernTheme;
  onThemeChange: (theme: ModernTheme) => void;
  previewSlides?: any[];
  className?: string;
}

export interface ThemeTransition {
  duration: number;
  easing: string;
  stagger: number;
}

/**
 * Live Theme Switcher Component
 */
export function LiveThemeSwitcher({
  themes,
  currentTheme,
  onThemeChange,
  previewSlides = [],
  className = ''
}: LiveThemeSwitcherProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<ModernTheme | null>(null);
  const [hoveredTheme, setHoveredTheme] = useState<ModernTheme | null>(null);

  /**
   * Optimized theme transition configuration
   */
  const transitionConfig: ThemeTransition = useMemo(() => ({
    duration: 0.3,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    stagger: 0.05
  }), []);

  /**
   * Handle theme selection with smooth transition
   */
  const handleThemeSelect = useCallback(async (theme: ModernTheme) => {
    if (theme.id === currentTheme.id || isTransitioning) return;

    setIsTransitioning(true);
    setPreviewTheme(theme);

    // Smooth transition delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 100));
    
    onThemeChange(theme);
    
    // Complete transition
    setTimeout(() => {
      setIsTransitioning(false);
      setPreviewTheme(null);
    }, transitionConfig.duration * 1000);
  }, [currentTheme.id, isTransitioning, onThemeChange, transitionConfig.duration]);

  /**
   * Handle theme preview on hover
   */
  const handleThemeHover = useCallback((theme: ModernTheme | null) => {
    if (!isTransitioning) {
      setHoveredTheme(theme);
    }
  }, [isTransitioning]);

  /**
   * Get effective theme for preview
   */
  const effectiveTheme = useMemo(() => {
    return previewTheme || hoveredTheme || currentTheme;
  }, [previewTheme, hoveredTheme, currentTheme]);

  /**
   * Theme categories for organized display
   */
  const themeCategories = useMemo(() => {
    const categories = themes.reduce((acc, theme) => {
      const category = theme.category || 'general';
      if (!acc[category]) acc[category] = [];
      acc[category].push(theme);
      return acc;
    }, {} as Record<string, ModernTheme[]>);

    return Object.entries(categories).map(([name, themeList]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      themes: themeList
    }));
  }, [themes]);

  return (
    <div className={`live-theme-switcher ${className}`}>
      {/* Theme Categories */}
      <div className="theme-categories">
        {themeCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.name}
            className="theme-category"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
          >
            <h3 className="category-title">{category.name}</h3>
            
            <div className="theme-grid">
              {category.themes.map((theme, themeIndex) => (
                <ThemePreviewCard
                  key={theme.id}
                  theme={theme}
                  isActive={theme.id === currentTheme.id}
                  isHovered={hoveredTheme?.id === theme.id}
                  isTransitioning={isTransitioning}
                  transitionDelay={themeIndex * transitionConfig.stagger}
                  onClick={() => handleThemeSelect(theme)}
                  onHover={() => handleThemeHover(theme)}
                  onLeave={() => handleThemeHover(null)}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live Preview Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={effectiveTheme.id}
          className="live-preview-panel"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: transitionConfig.duration }}
        >
          <div className="preview-header">
            <h4 className="preview-title">{effectiveTheme.name}</h4>
            <div className="preview-meta">
              <span className="theme-category">{effectiveTheme.category}</span>
              {effectiveTheme.description && (
                <span className="theme-description">{effectiveTheme.description}</span>
              )}
            </div>
          </div>

          <div className="preview-content">
            {/* Color Palette Preview */}
            <div className="color-palette-preview">
              <div className="palette-row">
                <div 
                  className="color-swatch primary"
                  style={{ backgroundColor: effectiveTheme.colors.primary }}
                  title="Primary Color"
                />
                <div 
                  className="color-swatch secondary"
                  style={{ backgroundColor: effectiveTheme.colors.secondary }}
                  title="Secondary Color"
                />
                <div 
                  className="color-swatch accent"
                  style={{ backgroundColor: effectiveTheme.colors.accent }}
                  title="Accent Color"
                />
                <div 
                  className="color-swatch background"
                  style={{ backgroundColor: effectiveTheme.colors.background }}
                  title="Background Color"
                />
              </div>
            </div>

            {/* Typography Preview */}
            <div className="typography-preview">
              <div 
                className="heading-sample"
                style={{ 
                  fontFamily: effectiveTheme.typography.headingFont,
                  color: effectiveTheme.colors.text.primary 
                }}
              >
                Sample Heading
              </div>
              <div 
                className="body-sample"
                style={{ 
                  fontFamily: effectiveTheme.typography.bodyFont,
                  color: effectiveTheme.colors.text.secondary 
                }}
              >
                Sample body text with proper typography
              </div>
            </div>

            {/* Mini Slide Preview */}
            {previewSlides.length > 0 && (
              <div className="mini-slide-preview">
                <MiniSlidePreview 
                  slide={previewSlides[0]} 
                  theme={effectiveTheme}
                  isAnimating={isTransitioning}
                />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Transition Indicator */}
      {isTransitioning && (
        <motion.div
          className="transition-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="transition-progress">
            <motion.div
              className="progress-bar"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: transitionConfig.duration }}
            />
          </div>
          <span className="transition-text">Applying theme...</span>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Theme Preview Card Component
 */
interface ThemePreviewCardProps {
  theme: ModernTheme;
  isActive: boolean;
  isHovered: boolean;
  isTransitioning: boolean;
  transitionDelay: number;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}

const ThemePreviewCard = React.memo(function ThemePreviewCard({
  theme,
  isActive,
  isHovered,
  isTransitioning,
  transitionDelay,
  onClick,
  onHover,
  onLeave
}: ThemePreviewCardProps) {
  return (
    <motion.div
      className={`theme-preview-card ${isActive ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ 
        delay: transitionDelay,
        duration: 0.2,
        ease: 'easeOut'
      }}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.secondary}20)`,
        borderColor: isActive ? theme.colors.primary : 'transparent',
        cursor: isTransitioning ? 'not-allowed' : 'pointer'
      }}
    >
      {/* Theme Preview */}
      <div className="card-preview">
        <div 
          className="preview-header"
          style={{ backgroundColor: theme.colors.primary }}
        >
          <div className="preview-title" style={{ color: theme.colors.text.inverse }}>
            {theme.name}
          </div>
        </div>
        
        <div 
          className="preview-body"
          style={{ backgroundColor: theme.colors.background }}
        >
          <div className="preview-content">
            <div 
              className="content-line primary"
              style={{ backgroundColor: theme.colors.text.primary }}
            />
            <div 
              className="content-line secondary"
              style={{ backgroundColor: theme.colors.text.secondary }}
            />
            <div 
              className="content-line accent"
              style={{ backgroundColor: theme.colors.accent }}
            />
          </div>
        </div>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          className="active-indicator"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ backgroundColor: theme.colors.primary }}
        >
          ✓
        </motion.div>
      )}

      {/* Theme Name */}
      <div className="theme-name">{theme.name}</div>
    </motion.div>
  );
});

/**
 * Mini Slide Preview Component
 */
interface MiniSlidePreviewProps {
  slide: any;
  theme: ModernTheme;
  isAnimating: boolean;
}

const MiniSlidePreview = React.memo(function MiniSlidePreview({
  slide,
  theme,
  isAnimating
}: MiniSlidePreviewProps) {
  return (
    <motion.div
      className="mini-slide-preview"
      animate={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text.primary
      }}
      transition={{ duration: 0.3 }}
      style={{
        aspectRatio: '16/9',
        borderRadius: '4px',
        padding: '8px',
        border: `1px solid ${theme.colors.borders.light}`,
        overflow: 'hidden'
      }}
    >
      <motion.div
        className="mini-slide-title"
        animate={{ color: theme.colors.primary }}
        transition={{ duration: 0.3 }}
        style={{
          fontSize: '10px',
          fontWeight: 'bold',
          marginBottom: '4px',
          fontFamily: theme.typography.headingFont
        }}
      >
        {slide?.title || 'Sample Slide Title'}
      </motion.div>
      
      <div className="mini-slide-content">
        {[1, 2, 3].map(i => (
          <motion.div
            key={i}
            className="mini-content-line"
            animate={{ backgroundColor: theme.colors.text.secondary }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            style={{
              height: '2px',
              marginBottom: '2px',
              borderRadius: '1px',
              width: `${100 - i * 10}%`
            }}
          />
        ))}
      </div>
    </motion.div>
  );
});

export default LiveThemeSwitcher;
