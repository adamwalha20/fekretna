'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme/context';
import { useI18n } from '@/lib/i18n/context';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const { locale } = useI18n();

  const isDark = theme === 'dark';
  const label = isDark
    ? locale === 'ar' ? 'تفعيل الوضع النهاري (الفاتح)' : locale === 'en' ? 'Switch to Light Mode' : 'Passer au Mode Jour'
    : locale === 'ar' ? 'تفعيل الوضع الليلي (الداكن)' : locale === 'en' ? 'Switch to Dark Mode' : 'Passer au Mode Nuit';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative inline-flex items-center justify-center h-9 w-9 rounded-2xl border transition-all duration-500 overflow-hidden select-none active:scale-90 ${
        isDark
          ? 'bg-slate-900/80 border-slate-700/70 text-amber-300 hover:text-amber-200 hover:border-amber-400/50 hover:bg-slate-800 shadow-md shadow-black/20'
          : 'bg-white/95 border-slate-200/90 text-indigo-600 hover:text-indigo-700 hover:border-indigo-300 hover:bg-slate-50 shadow-sm'
      } ${className}`}
      title={label}
      aria-label={label}
    >
      {/* Ambient background glow */}
      <span
        className={`absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none ${
          isDark
            ? 'bg-amber-400/10 opacity-0 group-hover:opacity-100'
            : 'bg-indigo-500/10 opacity-0 group-hover:opacity-100'
        }`}
      />

      {/* Sun Icon (visible in dark mode to switch to day) */}
      <span
        className={`absolute flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDark
            ? 'rotate-0 scale-100 opacity-100'
            : 'rotate-90 scale-0 opacity-0'
        }`}
      >
        <Sun className="h-4.5 w-4.5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] group-hover:rotate-45 transition-transform duration-300" />
      </span>

      {/* Moon Icon (visible in light mode to switch to night) */}
      <span
        className={`absolute flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDark
            ? '-rotate-90 scale-0 opacity-0'
            : 'rotate-0 scale-100 opacity-100'
        }`}
      >
        <Moon className="h-4.5 w-4.5 text-indigo-600 drop-shadow-[0_0_6px_rgba(99,102,241,0.4)] group-hover:-rotate-12 transition-transform duration-300" />
      </span>
    </button>
  );
}
