import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPaintBrush, HiSparkles, HiCheck } from 'react-icons/hi2';
import { PROFESSIONAL_THEMES, type ProfessionalTheme } from '../themes/professionalThemes';

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (themeId: string) => void;
  className?: string;
}

export default function ThemeSelector({ selectedTheme, onThemeChange, className = '' }: ThemeSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = [
    { id: 'all', name: 'All Themes', icon: HiSparkles },
    { id: 'corporate', name: 'Corporate', icon: HiPaintBrush },
    { id: 'creative', name: 'Creative', icon: HiPaintBrush },
    { id: 'startup', name: 'Startup', icon: HiPaintBrush },
    { id: 'finance', name: 'Finance', icon: HiPaintBrush },
    { id: 'healthcare', name: 'Healthcare', icon: HiPaintBrush },
    { id: 'academic', name: 'Academic', icon: HiPaintBrush }
  ];

  const filteredThemes = selectedCategory === 'all' 
    ? PROFESSIONAL_THEMES 
    : PROFESSIONAL_THEMES.filter(theme => theme.category === selectedCategory);

  return (
    <div className={`space-y-8 w-full ${className}`}>
      {/* Enhanced Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <motion.div
            className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl border border-indigo-200"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <HiPaintBrush className="w-6 h-6 text-indigo-600" />
          </motion.div>
          <h3 className="text-2xl font-bold text-slate-900">Choose Your Theme</h3>
        </div>
        <p className="text-lg text-slate-600 leading-relaxed">Select a professional theme that matches your presentation style</p>
      </div>

      {/* Enhanced Category Filter */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300
                ${selectedCategory === category.id
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-xl border border-indigo-400'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-md hover:shadow-lg'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-4 h-4" />
              {category.name}
            </motion.button>
          );
        })}
      </div>

      {/* Theme Grid - Responsive Layout with Full Width Coverage */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 w-full"
        layout
      >
        <AnimatePresence mode="popLayout">
          {filteredThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isSelected={selectedTheme === theme.id}
              onSelect={() => onThemeChange(theme.id)}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

interface ThemeCardProps {
  theme: ProfessionalTheme;
  isSelected: boolean;
  onSelect: () => void;
}

function ThemeCard({ theme, isSelected, onSelect }: ThemeCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 group
        ${isSelected
          ? 'ring-2 ring-indigo-500 shadow-2xl border border-indigo-200'
          : 'hover:shadow-xl border border-slate-200 hover:border-slate-300'
        }
      `}
      onClick={onSelect}
      style={{
        boxShadow: isSelected
          ? 'var(--shadow-glow-primary)'
          : 'var(--shadow-lg)'
      }}
    >
      {/* Compact Theme Preview */}
      <div
        className="h-24 p-3 relative"
        style={{
          background: theme.effects.gradients.background,
          borderRadius: `${theme.effects.borderRadius}px ${theme.effects.borderRadius}px 0 0`
        }}
      >
        {/* Compact Mini slide preview */}
        <div className="h-full flex flex-col justify-between">
          {/* Title area */}
          <div
            className="h-2 rounded"
            style={{
              background: theme.colors.primary,
              width: '60%'
            }}
          />

          {/* Content bullets */}
          <div className="space-y-0.5">
            <div
              className="h-1.5 rounded"
              style={{
                background: theme.colors.text.secondary,
                width: '80%',
                opacity: 0.7
              }}
            />
            <div
              className="h-1.5 rounded"
              style={{
                background: theme.colors.text.secondary,
                width: '65%',
                opacity: 0.7
              }}
            />
            <div
              className="h-1.5 rounded"
              style={{
                background: theme.colors.text.secondary,
                width: '75%',
                opacity: 0.7
              }}
            />
          </div>

          {/* Accent element */}
          <div
            className="h-1.5 rounded self-end"
            style={{
              background: theme.colors.accent,
              width: '25%'
            }}
          />
        </div>

        {/* Selection indicator */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
            >
              <HiCheck className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Compact Theme Info */}
      <div className="p-3 bg-white">
        <div className="text-center mb-2">
          <h4
            className="font-bold text-slate-900 text-sm mb-1"
            style={{ fontFamily: theme.typography.headings.fontFamily }}
          >
            {theme.name}
          </h4>
          <span
            className="px-2 py-1 text-xs font-medium rounded-full"
            style={{
              backgroundColor: theme.colors.primary + '20',
              color: theme.colors.primary
            }}
          >
            {theme.category}
          </span>
        </div>

        {/* Compact Color palette preview */}
        <div className="flex justify-center gap-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: theme.colors.primary }}
            title="Primary"
          />
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: theme.colors.secondary }}
            title="Secondary"
          />
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: theme.colors.accent }}
            title="Accent"
          />
          <div
            className="w-3 h-3 rounded-full border border-gray-300"
            style={{ backgroundColor: theme.colors.surface }}
            title="Surface"
          />
        </div>
      </div>

      {/* Hover overlay */}
      <motion.div
        className="absolute inset-0 bg-primary-500 bg-opacity-0 flex items-center justify-center"
        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-full p-2 shadow-lg"
        >
          <HiSparkles className="w-5 h-5 text-primary-500" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Theme preview component for showing how content looks with a theme
export function ThemePreview({ theme, content }: { theme: ProfessionalTheme; content: any }) {
  return (
    <div 
      className="w-full aspect-video rounded-lg p-6 flex flex-col justify-center"
      style={{ 
        background: theme.effects.gradients.background,
        fontFamily: theme.typography.body.fontFamily
      }}
    >
      <h1 
        className="text-2xl font-bold mb-4"
        style={{ 
          color: theme.colors.primary,
          fontFamily: theme.typography.headings.fontFamily,
          fontSize: `${theme.typography.headings.sizes.h1}px`
        }}
      >
        {content?.title || 'Sample Presentation Title'}
      </h1>
      
      <div className="space-y-2">
        {(content?.bullets || ['Key point one', 'Important insight two', 'Action item three']).map((bullet: string, index: number) => (
          <div key={index} className="flex items-start gap-3">
            <div 
              className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
              style={{ backgroundColor: theme.colors.accent }}
            />
            <span 
              className="leading-relaxed"
              style={{ 
                color: theme.colors.text.primary,
                fontSize: `${theme.typography.body.sizes.normal}px`
              }}
            >
              {bullet}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
