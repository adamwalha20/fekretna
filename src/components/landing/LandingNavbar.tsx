'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Sparkles,
  Compass,
  LogIn,
  Rocket,
  Lightbulb,
  ArrowUpRight,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { FekretnaLogo } from '@/components/ui/FekretnaLogo';

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { t } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    {
      href: '/app/ideas',
      label: t('navigation.ideas') || 'Idées',
      icon: Lightbulb,
      iconColor: 'text-amber-500 dark:text-amber-400',
    },
    {
      href: '/explore',
      label: t('navigation.exploreProjects') || 'Explorer les projets',
      icon: Compass,
      iconColor: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      href: '/app/discover',
      label: t('navigation.findTeam') || 'Trouver des cofondateurs',
      icon: Sparkles,
      iconColor: 'text-teal-600 dark:text-teal-400',
    },
    {
      href: '/about',
      label: t('navigation.about') || 'À propos',
      icon: null,
      iconColor: '',
    },
  ];

  return (
    <header className="sticky top-3 sm:top-5 z-50 w-full px-3 sm:px-6 pointer-events-none transition-all duration-300">
      <div className="mx-auto max-w-6xl w-full">
        {/* Main Floating Pill Navigation Bar */}
        <div
          className={`pointer-events-auto relative flex items-center justify-between px-3 sm:px-4 py-2 rounded-full transition-all duration-300 border ${
            scrolled
              ? 'bg-white/95 dark:bg-[#070b16]/90 border-slate-300/80 dark:border-white/15 shadow-xl shadow-slate-900/10 dark:shadow-2xl dark:shadow-cyan-950/40 backdrop-blur-2xl'
              : 'bg-white/80 dark:bg-[#070b16]/75 border-slate-200/80 dark:border-white/10 shadow-md shadow-slate-900/5 dark:shadow-lg dark:shadow-black/20 backdrop-blur-xl'
          }`}
        >
          {/* Brand Logo & Tagline */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 group pl-1.5 pr-2 focus:outline-none"
            aria-label="Fekretna Home"
          >
            <div className="relative">
              <FekretnaLogo
                size={34}
                withGlow
                className="group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                Fekretna
              </span>
              <span className="hidden sm:inline-flex text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200/90 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 font-arabic leading-none">
                من فكرة لفريق
              </span>
            </div>
          </Link>

          {/* Desktop Center Links Capsule */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-slate-100/60 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-cyan-700 dark:text-cyan-300 bg-white dark:bg-white/10 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10'
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110 ${link.iconColor}`}
                    />
                  )}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Side Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle className="scale-90" />
            <LanguageSelector compact={true} />

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all duration-200 active:scale-95"
            >
              <LogIn className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 rtl-flip" />
              <span>{t('navigation.login') || 'Connexion'}</span>
            </Link>

            <Link
              href="/signup"
              className="group relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-cyan-500/25 hover:shadow-lg hover:shadow-cyan-500/35 border border-cyan-400/40 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              <Rocket className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12" />
              <span>{t('navigation.join') || 'Rejoindre'}</span>
            </Link>
          </div>

          {/* Mobile Right Controls: Theme + Lang + Hamburger */}
          <div className="flex items-center gap-1.5 sm:hidden">
            <ThemeToggle className="scale-85" />
            <LanguageSelector compact={true} />
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition active:scale-90"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Card */}
        {mobileOpen && (
          <div className="pointer-events-auto mt-2 p-3.5 sm:hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#070b16]/95 backdrop-blur-2xl shadow-2xl shadow-black/20 animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-cyan-600 dark:hover:text-cyan-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {Icon && <Icon className={`h-4 w-4 ${link.iconColor}`} />}
                      <span>{link.label}</span>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 rtl-flip" />
                  </Link>
                );
              })}

              {/* Mobile Auth Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2 mt-1 border-t border-slate-100 dark:border-white/10">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition"
                >
                  <LogIn className="h-3.5 w-3.5 text-slate-400 rtl-flip" />
                  <span>{t('navigation.login') || 'Connexion'}</span>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition active:scale-95"
                >
                  <Rocket className="h-3.5 w-3.5" />
                  <span>{t('navigation.join') || 'Rejoindre'}</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
