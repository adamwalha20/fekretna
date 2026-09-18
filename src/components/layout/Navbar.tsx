'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Sparkles, Compass, LogIn, UserPlus, Lightbulb } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { FekretnaLogo } from '@/components/ui/FekretnaLogo';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, isRtl } = useI18n();

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#070a13]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <FekretnaLogo size={40} withGlow className="group-hover:scale-105 transition-transform duration-300" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition">
                Fekretna
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 font-arabic">
                من فكرة لفريق
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {t('landing.tagline')}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link
            href="/app/ideas"
            className="flex items-center gap-2 hover:text-cyan-600 dark:hover:text-cyan-300 transition duration-200 py-1"
          >
            <Lightbulb className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            {t('navigation.ideas') || 'Idées'}
          </Link>
          <Link
            href="/explore"
            className="flex items-center gap-2 hover:text-cyan-600 dark:hover:text-cyan-300 transition duration-200 py-1"
          >
            <Compass className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            {t('navigation.exploreProjects')}
          </Link>
          <Link
            href="/about"
            className="hover:text-cyan-600 dark:hover:text-cyan-300 transition duration-200 py-1"
          >
            {t('navigation.about')}
          </Link>
          <Link
            href="/app/discover"
            className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition duration-200 py-1"
          >
            <Sparkles className="h-4 w-4 text-cyan-600 dark:text-cyan-400 animate-pulse" />
            {t('navigation.findTeam')}
          </Link>
        </nav>

        {/* Desktop Actions & Language Selector */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <LanguageSelector compact={true} />

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700/80 transition"
          >
            <LogIn className="h-4 w-4 text-slate-500 dark:text-slate-400 rtl-flip" />
            {t('navigation.login')}
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 dark:from-cyan-500 dark:to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-xl shadow-md shadow-cyan-600/20 dark:shadow-cyan-500/25 border border-cyan-400/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <UserPlus className="h-4 w-4" />
            {t('navigation.join')}
          </Link>
        </div>

        {/* Mobile menu, Theme and Language */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <LanguageSelector compact={true} />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-xl p-2 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0b1120]/95 backdrop-blur-xl px-4 py-5 shadow-2xl animate-fade-in">
          <div className="flex flex-col gap-3">
            <Link
              href="/app/ideas"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-cyan-600 dark:hover:text-cyan-300 transition"
            >
              <Lightbulb className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              {t('navigation.ideas') || 'Idées'}
            </Link>
            <Link
              href="/explore"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-cyan-600 dark:hover:text-cyan-300 transition"
            >
              <Compass className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              {t('navigation.exploreProjects')}
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="px-3.5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-cyan-600 dark:hover:text-cyan-300 transition"
            >
              {t('navigation.about')}
            </Link>
            <Link
              href="/app/discover"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-500/30 rounded-xl"
            >
              <Sparkles className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              {t('navigation.findTeam')}
            </Link>
            <hr className="my-1 border-slate-200 dark:border-slate-800" />
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/80 rounded-xl transition"
            >
              <LogIn className="h-4 w-4 rtl-flip" />
              {t('navigation.login')}
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 dark:from-cyan-500 dark:to-indigo-600 rounded-xl shadow-lg shadow-cyan-600/20 dark:shadow-cyan-500/25 transition"
            >
              <UserPlus className="h-4 w-4" />
              {t('navigation.join')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
