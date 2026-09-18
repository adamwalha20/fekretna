'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import fr from '@/messages/fr.json';
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';

export type Locale = 'fr' | 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

type Messages = typeof fr;

const dictionaries: Record<Locale, Messages> = {
  fr,
  en: en as unknown as Messages,
  ar: ar as unknown as Messages,
};

interface I18nContextType {
  locale: Locale;
  dir: Direction;
  isRtl: boolean;
  isRTL: boolean;
  setLocale: (newLocale: Locale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  messages: Messages;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const SUPPORTED_LOCALES: { code: Locale; label: string; flag: string; dir: Direction }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ar', label: 'العربية', flag: '🇹🇳', dir: 'ltr' },
];

export function I18nProvider({
  children,
  initialLocale = 'fr',
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Sync initial stored preference from localStorage or cookie on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fekretna_locale') as Locale | null;
      if (saved && (saved === 'fr' || saved === 'en' || saved === 'ar')) {
        setLocaleState(saved);
      } else {
        const cookieMatch = document.cookie.match(/NEXT_LOCALE=([a-z]{2})/);
        if (cookieMatch && (cookieMatch[1] === 'fr' || cookieMatch[1] === 'en' || cookieMatch[1] === 'ar')) {
          setLocaleState(cookieMatch[1] as Locale);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Standard layout direction: keep LTR across all languages without swapping right and left
  const dir: Direction = 'ltr';

  // Apply lang and font-arabic to HTML root dynamically in real-time
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = locale;
      if (locale === 'ar') {
        document.documentElement.classList.add('font-arabic');
      } else {
        document.documentElement.classList.remove('font-arabic');
      }
    }
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('fekretna_locale', newLocale);
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    } catch {
      // ignore
    }
  }, []);

  const currentMessages = useMemo(() => dictionaries[locale] || dictionaries.fr, [locale]);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const parts = path.split('.');
      let current: unknown = currentMessages;

      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = (current as Record<string, unknown>)[part];
        } else {
          // Fallback to French if missing
          let fallback: unknown = dictionaries.fr;
          for (const fPart of parts) {
            if (fallback && typeof fallback === 'object' && fPart in fallback) {
              fallback = (fallback as Record<string, unknown>)[fPart];
            } else {
              fallback = null;
              break;
            }
          }
          current = fallback;
          break;
        }
      }

      if (typeof current !== 'string' || !current) {
        return '';
      }

      let result = current;
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          result = (result as string).replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
        });
      }
      return result;
    },
    [currentMessages]
  );

  const contextValue = useMemo(
    () => ({
      locale,
      dir,
      isRtl: false,
      isRTL: false,
      setLocale,
      t,
      messages: currentMessages,
    }),
    [locale, dir, setLocale, t, currentMessages]
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      locale: 'fr' as Locale,
      dir: 'ltr' as Direction,
      isRtl: false,
      isRTL: false,
      setLocale: () => {},
      t: (path: string) => path,
      messages: dictionaries.fr,
    };
  }
  return context;
}
