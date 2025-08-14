import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/apiClient';
import type { ProfessionalTheme } from '../themes/professionalThemes';

interface ThemeGalleryProps {
  onSelect?: (themeId: string) => void;
  selectedId?: string;
}

export default function ThemeGallery({ onSelect, selectedId }: ThemeGalleryProps) {
  const [themes, setThemes] = useState<ProfessionalTheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

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

  if (loading) return <div className="p-4 text-sm text-slate-600">Loading themes…</div>;
  if (error) return <div className="p-4 text-sm text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-slate-700">Theme Presets</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map(t => (
          <motion.button
            key={t.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`text-left rounded-xl border p-4 shadow-sm transition ${selectedId === t.id ? 'ring-2 ring-indigo-500' : 'hover:shadow-md'}`}
            onClick={() => onSelect?.(t.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-slate-900">{t.name}</div>
              <div className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">{t.category}</div>
            </div>
            <div className="text-xs text-slate-600 mb-3 line-clamp-2">{t.description}</div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded" style={{ background: t.colors.primary }} />
              <div className="w-5 h-5 rounded" style={{ background: t.colors.secondary }} />
              <div className="w-5 h-5 rounded" style={{ background: t.colors.accent }} />
              <div className="w-5 h-5 rounded border" style={{ background: t.colors.surface, borderColor: t.colors.borders.medium }} />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

