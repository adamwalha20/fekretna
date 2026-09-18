'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useI18n, SUPPORTED_LOCALES, Locale } from '@/lib/i18n/context';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full';
  compact?: boolean;
  className?: string;
}

export function LanguageSelector({ variant = 'compact', compact, className = '' }: LanguageSelectorProps) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isCompact = compact !== undefined ? compact : variant === 'compact';
  const currentConfig = SUPPORTED_LOCALES.find((l) => l.code === locale) || SUPPORTED_LOCALES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setOpen(false);
  };

  return (
    <div className={`relative inline-block text-start ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/60 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 backdrop-blur-md transition-all hover:border-cyan-500/50 hover:text-cyan-700 dark:hover:text-white shadow-xs focus:outline-none"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="text-sm leading-none">{currentConfig.flag}</span>
        {!isCompact ? (
          <span className="font-semibold text-slate-800 dark:text-slate-200">{currentConfig.label}</span>
        ) : (
          <span className="uppercase font-bold tracking-wider text-[11px] text-cyan-700 dark:text-cyan-400 group-hover:text-cyan-800 dark:group-hover:text-cyan-300">
            {currentConfig.code}
          </span>
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
            open ? 'rotate-180 text-cyan-600 dark:text-cyan-400' : ''
          }`}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-2 min-w-[150px] rounded-2xl border border-slate-200 dark:border-cyan-500/30 bg-white/95 dark:bg-slate-900/95 p-1.5 shadow-xl dark:shadow-2xl shadow-slate-200/50 dark:shadow-cyan-950/40 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 start-0"
          role="menu"
        >
          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-400/80">
            {locale === 'ar' ? 'اختر اللغة' : locale === 'fr' ? 'Choisir la langue' : 'Choose language'}
          </div>
          <div className="space-y-0.5">
            {SUPPORTED_LOCALES.map((item) => {
              const isSelected = item.code === locale;
              return (
                <button
                  key={item.code}
                  onClick={() => handleSelect(item.code)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-cyan-50 text-cyan-800 border border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.flag}</span>
                    <span className={item.code === 'ar' ? 'font-arabic' : ''}>{item.label}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
