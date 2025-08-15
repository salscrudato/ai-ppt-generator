/**
 * EnhancedThemeGallery Component
 * 
 * Advanced theme selection interface with instant preview updates and persistence.
 * Integrates with backend /generate endpoint for themeId parameter handling.
 * 
 * Features:
 * - Theme persistence across sessions
 * - Instant preview re-skinning with <200ms updates
 * - Accessibility-compliant with proper ARIA labels and keyboard navigation
 * - Category filtering and search functionality
 * - Professional theme cards with live previews
 * - Integration with backend theme system
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiCheck, 
  HiSparkles, 
  HiAdjustmentsHorizontal,
  HiMagnifyingGlass,
  HiXMark
} from 'react-icons/hi2';
import { api } from '../utils/apiClient';
import type { ProfessionalTheme } from '../themes/professionalThemes';
import EnhancedSlidePreview from './EnhancedSlidePreview';
import type { SlideSpec } from '../types';
import { THEME_CATEGORIES, ANIMATION_CONSTANTS } from '../constants/slideConstants';
import clsx from 'clsx';

interface EnhancedThemeGalleryProps {
  /** Callback when theme is selected */
  onSelect?: (themeId: string) => void;
  /** Currently selected theme ID */
  selectedId?: string;
  /** Whether to show category filters */
  showCategories?: boolean;
  /** Whether to show search functionality */
  showSearch?: boolean;
  /** Compact mode for smaller spaces */
  compact?: boolean;
  /** Custom title */
  title?: string;
  /** Sample slide for theme preview */
  sampleSlide?: SlideSpec;
  /** Whether to persist selection */
  persistSelection?: boolean;
}

// Storage key for theme persistence
const THEME_STORAGE_KEY = 'ai-ppt-selected-theme';

// Default sample slide for theme previews
const DEFAULT_SAMPLE_SLIDE: SlideSpec = {
  id: 'theme-preview',
  title: 'Sample Presentation Title',
  layout: 'title-bullets',
  bullets: [
    'First key point with important information',
    'Second bullet highlighting main benefits',
    'Third point demonstrating value proposition',
    'Fourth item showing comprehensive coverage'
  ],
  paragraph: 'This is a sample paragraph that demonstrates how your content will look with this theme applied to your presentation.'
};

export default function EnhancedThemeGallery({
  onSelect,
  selectedId: externalSelectedId,
  showCategories = true,
  showSearch = true,
  compact = false,
  title = "Choose Your Theme",
  sampleSlide = DEFAULT_SAMPLE_SLIDE,
  persistSelection = true
}: EnhancedThemeGalleryProps) {
  const [themes, setThemes] = useState<ProfessionalTheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [internalSelectedId, setInternalSelectedId] = useState<string>(() => {
    if (externalSelectedId) return externalSelectedId;
    if (persistSelection && typeof window !== 'undefined') {
      return localStorage.getItem(THEME_STORAGE_KEY) || '';
    }
    return '';
  });

  // Use external or internal selected ID
  const selectedId = externalSelectedId || internalSelectedId;

  // Load themes from API
  useEffect(() => {
    let mounted = true;
    
    const loadThemes = async () => {
      setLoading(true);
      try {
        const response = await api.getThemePresets();
        if (!mounted) return;
        
        if (response.success && (response.data as any)?.themes) {
          setThemes((response.data as any).themes);
        } else {
          setError(response.error || 'Failed to load themes');
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
  }, []);

  // Filter themes based on category and search
  const filteredThemes = useMemo(() => {
    let filtered = themes;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(theme => 
        theme.category === selectedCategory || 
        theme.tags?.includes(selectedCategory)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(theme =>
        theme.name.toLowerCase().includes(query) ||
        theme.description?.toLowerCase().includes(query) ||
        theme.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [themes, selectedCategory, searchQuery]);

  // Handle theme selection with persistence
  const handleThemeSelect = useCallback((themeId: string) => {
    setInternalSelectedId(themeId);
    
    // Persist selection
    if (persistSelection && typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    }
    
    // Notify parent with debouncing for performance
    if (onSelect) {
      const timeoutId = setTimeout(() => {
        onSelect(themeId);
      }, ANIMATION_CONSTANTS.debounceMs);
      
      return () => clearTimeout(timeoutId);
    }
  }, [onSelect, persistSelection]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(['all']);
    themes.forEach(theme => {
      cats.add(theme.category);
      theme.tags?.forEach(tag => cats.add(tag));
    });
    return Array.from(cats);
  }, [themes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-slate-600">Loading themes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800">
          <HiXMark className="w-5 h-5" />
          <span className="font-medium">Failed to load themes</span>
        </div>
        <p className="text-red-700 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <HiSparkles className="w-4 h-4" />
          <span>{filteredThemes.length} themes</span>
        </div>
      </div>

      {/* Search and Filters */}
      {(showSearch || showCategories) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          {showSearch && (
            <div className="relative flex-1">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Search themes"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Category Filter */}
          {showCategories && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={clsx(
                    'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                  )}
                  aria-pressed={selectedCategory === category}
                >
                  {THEME_CATEGORIES[category as keyof typeof THEME_CATEGORIES] || 
                   category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Theme Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedCategory}-${searchQuery}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={clsx(
            'grid gap-4',
            compact
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {filteredThemes.map(theme => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              selected={selectedId === theme.id}
              onSelect={handleThemeSelect}
              compact={compact}
              sampleSlide={sampleSlide}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredThemes.length === 0 && (
        <div className="text-center py-12">
          <HiAdjustmentsHorizontal className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No themes found</h3>
          <p className="text-slate-500">
            {searchQuery ? 'Try adjusting your search terms' : 'Try selecting a different category'}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Individual theme card component
 */
interface ThemeCardProps {
  theme: ProfessionalTheme;
  selected: boolean;
  onSelect: (themeId: string) => void;
  compact: boolean;
  sampleSlide: SlideSpec;
}

function ThemeCard({ theme, selected, onSelect, compact, sampleSlide }: ThemeCardProps) {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        'relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200',
        'hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
        selected 
          ? 'border-blue-500 shadow-md' 
          : 'border-slate-200 hover:border-slate-300'
      )}
      onClick={() => onSelect(theme.id)}
      role="button"
      tabIndex={0}
      aria-label={`Select ${theme.name} theme`}
      aria-pressed={selected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(theme.id);
        }
      }}
    >
      {/* Selection Indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 z-10 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
        >
          <HiCheck className="w-4 h-4 text-white" />
        </motion.div>
      )}

      {/* Theme Preview */}
      <div className="aspect-video">
        <EnhancedSlidePreview
          spec={sampleSlide}
          theme={theme}
          size={compact ? 'small' : 'medium'}
          className="w-full h-full"
        />
      </div>

      {/* Theme Info */}
      <div className="p-3 bg-white">
        <h3 className="font-medium text-slate-900 text-sm">
          {theme.name}
        </h3>
        {!compact && theme.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {theme.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-400 capitalize">
            {theme.category}
          </span>
          {theme.tags && (
            <div className="flex gap-1">
              {theme.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
