import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiCheck, HiSparkles, HiAdjustmentsHorizontal } from 'react-icons/hi2';
import { api } from '../utils/apiClient';
import type { ProfessionalTheme } from '../themes/professionalThemes';
import clsx from 'clsx';

interface ThemeGalleryProps {
  onSelect?: (themeId: string) => void;
  selectedId?: string;
  showCategories?: boolean;
  compact?: boolean;
  title?: string;
}

export default function ThemeGallery({
  onSelect,
  selectedId,
  showCategories = true,
  compact = false,
  title = "Choose Your Theme"
}: ThemeGalleryProps) {
  const [themes, setThemes] = useState<ProfessionalTheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const resp = await api.getThemePresets();
      if (!mounted) return;
      if (resp.success && (resp.data as any)?.themes) {
        setThemes((resp.data as any).themes);
      } else {
        setError(resp.error || 'Failed to load themes');
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(themes.map(theme => theme.category)))];

  // Filter themes by category
  const filteredThemes = selectedCategory === 'all'
    ? themes
    : themes.filter(theme => theme.category === selectedCategory);

  // Category display names
  const categoryNames: Record<string, string> = {
    all: 'All Themes',
    corporate: 'Corporate',
    creative: 'Creative',
    academic: 'Academic',
    startup: 'Startup',
    healthcare: 'Healthcare',
    finance: 'Finance',
    consulting: 'Consulting',
    technology: 'Technology',
    modern: 'Modern',
    vibrant: 'Vibrant',
    natural: 'Natural'
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-lg font-semibold text-slate-900">{title}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-slate-200 rounded-xl h-32"></div>
            </div>
          ))}
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
            <HiSparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        {showCategories && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <HiAdjustmentsHorizontal className="w-4 h-4" />
            <span>{filteredThemes.length} theme{filteredThemes.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Category Filter */}
      {showCategories && categories.length > 2 && (
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              )}
            >
              {categoryNames[category] || category}
            </button>
          ))}
        </div>
      )}

      {/* Theme Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
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
              onSelect={onSelect}
              compact={compact}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredThemes.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <div className="text-lg font-medium">No themes found</div>
          <div className="text-sm">Try selecting a different category</div>
        </div>
      )}
    </div>
  );
}

// Enhanced Theme Card Component
interface ThemeCardProps {
  theme: ProfessionalTheme;
  selected: boolean;
  onSelect?: (themeId: string) => void;
  compact?: boolean;
}

function ThemeCard({ theme, selected, onSelect, compact = false }: ThemeCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        'relative text-left rounded-xl border-2 shadow-sm transition-all duration-200 overflow-hidden group',
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-lg'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      )}
      onClick={() => onSelect?.(theme.id)}
      aria-label={`Select ${theme.name} theme`}
    >
      {/* Theme Preview */}
      <div
        className={clsx(
          'relative overflow-hidden',
          compact ? 'h-20' : 'h-24'
        )}
        style={{
          background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`
        }}
      >
        {/* Sample slide content */}
        <div className="absolute inset-0 p-3 flex flex-col justify-between">
          <div>
            <div
              className={clsx(
                'font-bold leading-tight',
                compact ? 'text-xs' : 'text-sm'
              )}
              style={{ color: theme.colors.text.primary }}
            >
              Sample Title
            </div>
            {!compact && (
              <div
                className="text-xs mt-1 opacity-75"
                style={{ color: theme.colors.text.secondary }}
              >
                • Sample bullet point
              </div>
            )}
          </div>

          {/* Color palette preview */}
          <div className="flex gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.colors.primary }}
            />
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.colors.secondary }}
            />
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.colors.accent }}
            />
          </div>
        </div>

        {/* Selection indicator */}
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg"
          >
            <HiCheck className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </div>

      {/* Theme Info */}
      <div className={clsx('p-3', compact && 'p-2')}>
        <div className="flex items-center justify-between mb-1">
          <div className={clsx(
            'font-semibold text-slate-900 truncate',
            compact ? 'text-sm' : 'text-base'
          )}>
            {theme.name}
          </div>
          <div className={clsx(
            'px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize flex-shrink-0 ml-2',
            compact ? 'text-xs' : 'text-xs'
          )}>
            {theme.category}
          </div>
        </div>

        {!compact && theme.description && (
          <div className="text-xs text-slate-600 line-clamp-2">
            {theme.description}
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </motion.button>
  );
}

