import React from 'react';
import { PROFESSIONAL_THEMES, type ProfessionalTheme } from '../themes/professionalThemes';
import { useThemeContext } from '../contexts/ThemeContext';

interface ThemeGalleryProps {
  className?: string;
  compact?: boolean;
  onThemeSelected?: (theme: ProfessionalTheme) => void;
}

export default function ThemeGallery({ className = '', compact = false, onThemeSelected }: ThemeGalleryProps) {
  const { themeId, setTheme } = useThemeContext();

  const handleSelect = (t: ProfessionalTheme) => {
    setTheme(t.id);
    onThemeSelected?.(t);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">Themes</h3>
        <span className="text-xs text-slate-500">{PROFESSIONAL_THEMES.length} options</span>
      </div>
      <div className={compact ? 'grid grid-cols-3 gap-2' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'}>
        {PROFESSIONAL_THEMES.slice(0, compact ? 6 : 12).map((t) => (
          <button
            key={t.id}
            onClick={() => handleSelect(t)}
            aria-label={`Select theme ${t.name}`}
            className={`group relative rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              themeId === t.id ? 'border-indigo-500 shadow-md' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Swatch */}
            <div className="p-2">
              <div className="flex items-center gap-1 mb-2">
                <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: `#${t.colors.primary}` }} />
                <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: `#${t.colors.secondary}` }} />
                <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: `#${t.colors.accent}` }} />
              </div>
              <div className="h-14 rounded overflow-hidden border border-slate-200">
                <div className="h-2" style={{ background: t.effects?.gradients?.primary || `linear-gradient(90deg, #${t.colors.primary}, #${t.colors.secondary})` }} />
                <div className="p-2 text-left">
                  <div className="text-[11px] font-semibold text-slate-800 truncate">{t.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{t.category}</div>
                </div>
              </div>
            </div>
            {/* Active indicator */}
            {themeId === t.id && (
              <div className="absolute inset-0 rounded-lg ring-2 ring-indigo-500 pointer-events-none" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

