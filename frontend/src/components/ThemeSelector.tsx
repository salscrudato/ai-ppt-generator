/**
 * Enhanced Theme Selector Component
 * 
 * Professional theme selection with live preview and categorization
 * Features:
 * - Theme categories (Corporate, Creative, Academic, etc.)
 * - Live preview updates
 * - Accessibility compliant
 * - Responsive grid layout
 * - Search and filtering
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiCheck, HiMagnifyingGlass, HiSparkles } from 'react-icons/hi2';

interface Theme {
  id: string;
  name: string;
  category: 'corporate' | 'creative' | 'academic' | 'startup' | 'natural' | 'vibrant';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
  description?: string;
}

interface ThemeSelectorProps {
  /** Available themes */
  themes: Theme[];
  /** Currently selected theme ID */
  selectedThemeId: string;
  /** Callback when theme is selected */
  onThemeSelect: (themeId: string) => void;
  /** Whether to show search */
  showSearch?: boolean;
  /** Whether to show categories */
  showCategories?: boolean;
  /** Grid size */
  size?: 'small' | 'medium' | 'large';
  /** Additional CSS classes */
  className?: string;
}

const CATEGORY_LABELS = {
  corporate: 'Corporate',
  creative: 'Creative',
  academic: 'Academic',
  startup: 'Startup',
  natural: 'Natural',
  vibrant: 'Vibrant'
} as const;

const CATEGORY_ICONS = {
  corporate: '🏢',
  creative: '🎨',
  academic: '🎓',
  startup: '🚀',
  natural: '🌿',
  vibrant: '✨'
} as const;

export default function ThemeSelector({
  themes,
  selectedThemeId,
  onThemeSelect,
  showSearch = true,
  showCategories = true,
  size = 'medium',
  className = ''
}: ThemeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter themes based on search and category
  const filteredThemes = useMemo(() => {
    return themes.filter(theme => {
      const matchesSearch = !searchQuery || 
        theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theme.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || theme.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [themes, searchQuery, selectedCategory]);

  // Group themes by category
  const themesByCategory = useMemo(() => {
    const grouped: Record<string, Theme[]> = {};
    filteredThemes.forEach(theme => {
      if (!grouped[theme.category]) {
        grouped[theme.category] = [];
      }
      grouped[theme.category].push(theme);
    });
    return grouped;
  }, [filteredThemes]);

  const categories = Object.keys(themesByCategory);

  const gridCols = size === 'small' ? 'grid-cols-3' : size === 'large' ? 'grid-cols-6' : 'grid-cols-4';
  const themeSize = size === 'small' ? 'w-16 h-12' : size === 'large' ? 'w-24 h-16' : 'w-20 h-14';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      {(showSearch || showCategories) && (
        <div className="space-y-4">
          {showSearch && (
            <div className="relative">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {showCategories && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Themes
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}</span>
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                  <span className="ml-1 text-xs opacity-70">
                    ({themesByCategory[category].length})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Theme Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${searchQuery}-${selectedCategory}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {selectedCategory === 'all' ? (
            // Show all themes in one grid
            <div className={`grid ${gridCols} gap-3`}>
              {filteredThemes.map(theme => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isSelected={theme.id === selectedThemeId}
                  onSelect={() => onThemeSelect(theme.id)}
                  size={themeSize}
                />
              ))}
            </div>
          ) : (
            // Show themes grouped by category
            <div className="space-y-6">
              {categories.map(category => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>{CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}</span>
                    {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                    <span className="text-sm text-gray-500 font-normal">
                      ({themesByCategory[category].length})
                    </span>
                  </h3>
                  <div className={`grid ${gridCols} gap-3`}>
                    {themesByCategory[category].map(theme => (
                      <ThemeCard
                        key={theme.id}
                        theme={theme}
                        isSelected={theme.id === selectedThemeId}
                        onSelect={() => onThemeSelect(theme.id)}
                        size={themeSize}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* No results */}
      {filteredThemes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <HiSparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No themes found matching your criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Individual theme card component
 */
function ThemeCard({
  theme,
  isSelected,
  onSelect,
  size
}: {
  theme: Theme;
  isSelected: boolean;
  onSelect: () => void;
  size: string;
}) {
  return (
    <motion.button
      onClick={onSelect}
      className={`relative ${size} rounded-lg border-2 transition-all duration-200 group ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={theme.description || theme.name}
    >
      {/* Theme preview */}
      <div className="w-full h-full rounded-md overflow-hidden">
        {/* Background */}
        <div
          className="w-full h-2/3"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`
          }}
        />
        {/* Color palette */}
        <div className="w-full h-1/3 flex">
          <div className="flex-1" style={{ backgroundColor: theme.colors.primary }} />
          <div className="flex-1" style={{ backgroundColor: theme.colors.secondary }} />
          <div className="flex-1" style={{ backgroundColor: theme.colors.accent }} />
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
        >
          <HiCheck className="w-4 h-4 text-white" />
        </motion.div>
      )}

      {/* Theme name tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {theme.name}
      </div>
    </motion.button>
  );
}
