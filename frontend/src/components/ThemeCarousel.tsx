import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronLeft, HiChevronRight, HiCheck, HiSparkles } from 'react-icons/hi2';
import { api } from '../utils/apiClient';
import type { ProfessionalTheme } from '../themes/professionalThemes';
import clsx from 'clsx';

interface ThemeCarouselProps {
  /** Callback when theme is selected. Only one theme can be selected at a time. */
  onSelect?: (themeId: string) => void;
  /** Currently selected theme ID. Only one theme can be selected at a time. */
  selectedId?: string;
  /** Custom title */
  title?: string;
  /** Show theme categories */
  showCategories?: boolean;
}

interface ThemeCardProps {
  theme: ProfessionalTheme;
  selected: boolean;
  onSelect: (themeId: string) => void;
  index: number;
  totalThemes: number;
}

// Responsive configuration with improved sizing
const getResponsiveConfig = () => {
  if (typeof window === 'undefined') return { themesPerView: 4, cardWidth: 320, cardGap: 24 };

  const width = window.innerWidth;
  if (width < 640) return { themesPerView: 1, cardWidth: 300, cardGap: 20 }; // Mobile
  if (width < 1024) return { themesPerView: 2, cardWidth: 320, cardGap: 22 }; // Tablet
  if (width < 1280) return { themesPerView: 3, cardWidth: 320, cardGap: 24 }; // Desktop
  return { themesPerView: 4, cardWidth: 320, cardGap: 24 }; // Large desktop
};

export default function ThemeCarousel({
  onSelect,
  selectedId,
  title = "Choose Your Theme",
  showCategories = true
}: ThemeCarouselProps) {
  const [themes, setThemes] = useState<ProfessionalTheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isHovered, setIsHovered] = useState(false);
  const [responsiveConfig, setResponsiveConfig] = useState(getResponsiveConfig());
  const carouselRef = useRef<HTMLDivElement>(null);

  // Add CSS to hide scrollbars
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .theme-carousel-container::-webkit-scrollbar {
        display: none;
      }
      .theme-carousel-container {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Update responsive config on window resize
  useEffect(() => {
    const handleResize = () => {
      setResponsiveConfig(getResponsiveConfig());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load themes from API
  useEffect(() => {
    let mounted = true;
    
    const loadThemes = async () => {
      setLoading(true);
      try {
        const resp = await api.getThemePresets();
        if (!mounted) return;
        
        if (resp.success && (resp.data as any)?.themes) {
          const loadedThemes = (resp.data as any).themes;
          setThemes(loadedThemes);
          
          // Find selected theme index and center it
          if (selectedId) {
            const selectedIndex = loadedThemes.findIndex((theme: ProfessionalTheme) => theme.id === selectedId);
            if (selectedIndex !== -1) {
              const config = getResponsiveConfig();
              setCurrentIndex(Math.max(0, selectedIndex - Math.floor(config.themesPerView / 2)));
            }
          }
        } else {
          setError(resp.error || 'Failed to load themes');
        }
      } catch (err) {
        if (!mounted) return;
        setError('Network error loading themes');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadThemes();
    return () => { mounted = false; };
  }, [selectedId]);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(themes.map(theme => theme.category)))];

  // Filter themes by category
  const filteredThemes = selectedCategory === 'all'
    ? themes
    : themes.filter(theme => theme.category === selectedCategory);

  const { themesPerView, cardWidth, cardGap } = responsiveConfig;

  // Function to center a theme smoothly
  const centerTheme = (themeIndex: number) => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    const containerWidth = container.clientWidth;
    const cardTotalWidth = cardWidth + cardGap;

    // Calculate the position to center the selected theme
    const targetScrollLeft = (themeIndex * cardTotalWidth) - (containerWidth / 2) + (cardWidth / 2);

    // Ensure we don't scroll beyond bounds
    const maxScroll = container.scrollWidth - containerWidth;
    const clampedScroll = Math.max(0, Math.min(targetScrollLeft, maxScroll));

    container.scrollTo({
      left: clampedScroll,
      behavior: 'smooth'
    });
  };

  // Keyboard navigation for horizontal scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== document.body || !carouselRef.current) return; // Only handle when not in input fields

      const container = carouselRef.current;
      const scrollAmount = cardWidth + cardGap;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
          break;
        case 'ArrowRight':
          e.preventDefault();
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [cardWidth, cardGap]);

  // Center selected theme on initial load
  useEffect(() => {
    if (selectedId && filteredThemes.length > 0) {
      const themeIndex = filteredThemes.findIndex(theme => theme.id === selectedId);
      if (themeIndex !== -1) {
        // Delay to ensure DOM is ready
        setTimeout(() => centerTheme(themeIndex), 300);
      }
    }
  }, [selectedId, filteredThemes, cardWidth, cardGap]);

  // Smooth auto-scroll functionality (pauses on hover)
  useEffect(() => {
    if (isHovered || filteredThemes.length <= 4 || selectedId) return; // Don't auto-scroll if theme is selected

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const container = carouselRef.current;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        const maxScroll = scrollWidth - clientWidth;

        // Calculate smooth scroll increment (about one card width)
        const scrollIncrement = (cardWidth + cardGap);
        const currentScroll = container.scrollLeft;
        const nextScroll = currentScroll + scrollIncrement;

        if (nextScroll >= maxScroll) {
          // Reset to beginning smoothly
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll to next position
          container.scrollTo({ left: nextScroll, behavior: 'smooth' });
        }
      }
    }, 3000); // Auto-scroll every 3 seconds for smoother experience

    return () => clearInterval(interval);
  }, [isHovered, filteredThemes.length, cardWidth, cardGap, selectedId]);

  const handleThemeSelect = (themeId: string) => {
    // Find the index of the selected theme for centering
    const themeIndex = filteredThemes.findIndex(theme => theme.id === themeId);

    if (selectedId === themeId) {
      // For deselection, use default theme instead of empty string
      onSelect?.('corporate-blue');
    } else {
      onSelect?.(themeId);

      // Center the selected theme smoothly
      if (themeIndex !== -1) {
        setTimeout(() => centerTheme(themeIndex), 150); // Small delay to ensure DOM updates
      }
    }

    // Log for debugging
    console.log('ThemeCarousel: Selected theme:', themeId, 'Previous:', selectedId, 'Index:', themeIndex);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>
          <span>Loading themes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
        <div className="text-red-700 font-medium">Failed to load themes</div>
        <div className="text-red-600 text-sm mt-1">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
            <HiSparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
        </div>
        <p className="text-slate-600">Select one theme for your presentation</p>
        <div className="text-sm text-slate-500">
          {filteredThemes.length} theme{filteredThemes.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Category Filter */}
      {showCategories && categories.length > 2 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentIndex(0);
                }}
                className={clsx(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                  selectedCategory === category
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Carousel */}
      <div className="relative">
        {/* Horizontally Scrollable Carousel Container */}
        <div
          className="theme-carousel-container overflow-x-auto overflow-y-hidden pb-4"
          ref={carouselRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            scrollBehavior: 'smooth',
            scrollSnapType: 'x mandatory'
          }}
        >
          <div
            className="flex gap-5 w-max"
            role="radiogroup"
            aria-label="Choose theme. Only one theme can be selected at a time."
          >
            {filteredThemes.map((theme, index) => (
              <motion.div
                key={theme.id}
                style={{ scrollSnapAlign: 'start' }}
                className="flex-shrink-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
              >
                <ThemeCard
                  theme={theme}
                  selected={selectedId === theme.id}
                  onSelect={handleThemeSelect}
                  index={index}
                  totalThemes={filteredThemes.length}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Simplified Dots Indicator */}
        {filteredThemes.length > 4 && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: Math.min(5, Math.ceil(filteredThemes.length / 3)) }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (carouselRef.current) {
                    const scrollPosition = index * (cardWidth + cardGap) * 3;
                    carouselRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
                  }
                }}
                className={clsx(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  'bg-slate-300 hover:bg-slate-400 hover:w-4'
                )}
                aria-label={`Scroll to theme group ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Auto-scroll Status */}
        {filteredThemes.length > 4 && (
          <div className="text-center mt-3">
            <div className="text-xs text-slate-500">
              {isHovered ? 'Auto-scroll paused' : 'Auto-scrolling'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ThemeCard({ theme, selected, onSelect, index, totalThemes }: ThemeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { cardWidth } = getResponsiveConfig();

  return (
    <motion.div
      className="flex-shrink-0"
      style={{ width: cardWidth }}
      whileHover={{ scale: selected ? 1.08 : 1.05, y: selected ? -12 : -8 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{
        scale: selected ? 1.02 : 1,
        y: selected ? -4 : 0
      }}
    >
      <div
        className={clsx(
          'relative rounded-2xl border-2 shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group',
          'bg-white hover:shadow-2xl',
          selected
            ? 'border-indigo-500 ring-4 ring-indigo-200/60 shadow-indigo-200/50 shadow-2xl bg-gradient-to-br from-indigo-50 to-white'
            : isHovered
            ? 'border-indigo-300 shadow-indigo-100/30 shadow-xl'
            : 'border-slate-200 hover:border-slate-300'
        )}
        onClick={() => onSelect(theme.id)}
        role="radio"
        tabIndex={selected ? 0 : -1}
        aria-checked={selected}
        aria-label={`${selected ? 'Selected' : 'Select'} ${theme.name} theme`}
      >
        {/* Theme Preview */}
        <div
          className={clsx(
            "relative transition-all duration-300",
            selected ? "h-40" : "h-36"
          )}
          style={{
            background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`
          }}
        >
          {/* Sample Content */}
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <div>
              <div
                className={clsx(
                  "font-bold leading-tight mb-3 transition-all duration-300",
                  selected ? "text-base" : "text-sm"
                )}
                style={{ color: theme.colors.text.primary }}
              >
                Sample Title
              </div>
              <div className="flex gap-1.5">
                <div
                  className={clsx(
                    "rounded-full transition-all duration-300",
                    selected ? "w-3 h-3" : "w-2 h-2"
                  )}
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div
                  className={clsx(
                    "rounded-full transition-all duration-300",
                    selected ? "w-3 h-3" : "w-2 h-2"
                  )}
                  style={{ backgroundColor: theme.colors.secondary }}
                />
                <div
                  className={clsx(
                    "rounded-full transition-all duration-300",
                    selected ? "w-3 h-3" : "w-2 h-2"
                  )}
                  style={{ backgroundColor: theme.colors.accent }}
                />
              </div>
            </div>

            {/* Additional content for selected theme */}
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs opacity-75"
                style={{ color: theme.colors.text.secondary }}
              >
                {theme.category}
              </motion.div>
            )}
          </div>

          {/* Selection Indicator */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -180 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0, rotate: 180 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="absolute top-3 right-3 w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl ring-2 ring-white"
              >
                <HiCheck className="w-6 h-6 text-white font-bold" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected Theme Glow Effect */}
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none"
            />
          )}
        </div>

        {/* Theme Info */}
        <div className={clsx(
          "p-4 transition-all duration-300",
          selected ? "bg-gradient-to-r from-indigo-50 to-transparent" : ""
        )}>
          <div className={clsx(
            "font-semibold mb-1 transition-all duration-300",
            selected ? "text-indigo-900 text-base" : "text-slate-900 text-sm"
          )}>
            {theme.name}
          </div>
          <div className={clsx(
            "capitalize transition-all duration-300",
            selected ? "text-indigo-600 text-sm font-medium" : "text-slate-500 text-xs"
          )}>
            {theme.category}
          </div>

          {/* Selected indicator badge */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
            >
              ✓ Selected
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
