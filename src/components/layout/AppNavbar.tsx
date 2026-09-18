'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Plus, LogOut, User, Settings, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n/context';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { FekretnaLogo } from '@/components/ui/FekretnaLogo';

interface AppNavbarProps {
  userEmail?: string;
  userName?: string;
  avatarUrl?: string | null;
  unreadNotifications?: number;
  isAdmin?: boolean;
}

export function AppNavbar({
  userEmail,
  userName = 'Membre Fekretna',
  avatarUrl,
  unreadNotifications = 0,
  isAdmin = false,
}: AppNavbarProps) {
  const router = useRouter();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { t, isRtl } = useI18n();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#070a13]/85 px-4 sm:px-6 backdrop-blur-xl transition-colors">
      {/* Brand logo */}
      <div className="flex items-center gap-3">
        <Link href="/app/discover" className="flex items-center gap-2.5 group">
          <FekretnaLogo size={36} withGlow className="group-hover:scale-105 transition-transform duration-300" />
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition hidden sm:inline tracking-tight">
              Fekretna
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 hidden sm:inline font-arabic">
              من فكرة لفريق
            </span>
          </div>
        </Link>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Create Project CTA */}
        <Link
          href="/app/projects/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 dark:from-cyan-500 dark:to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-xl shadow-md shadow-cyan-600/20 dark:shadow-cyan-500/20 border border-cyan-400/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">{t('projects.createProject')}</span>
        </Link>

        {/* Theme mode toggle */}
        <ThemeToggle />

        {/* Language selector */}
        <LanguageSelector compact={true} />

        {/* Notifications */}
        <Link
          href="/app/notifications"
          className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 transition"
          aria-label={t('navigation.notifications')}
        >
          <Bell className="h-5 w-5" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950 shadow-sm shadow-cyan-500/50 animate-pulse">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </Link>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 rounded-xl p-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 transition focus:outline-none"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={userName}
                className="h-8 w-8 rounded-full object-cover border border-cyan-500/40 shadow-sm"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 font-bold text-xs border border-cyan-300 dark:border-cyan-500/40">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden md:inline">
              {userName}
            </span>
          </button>

          {userDropdownOpen && (
            <div
              className={`absolute mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-700/70 bg-white/95 dark:bg-[#0d1527]/95 p-2 shadow-xl dark:shadow-2xl z-50 backdrop-blur-xl animate-fade-in ${
                isRtl ? 'left-0' : 'right-0'
              }`}
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{userName}</p>
                {userEmail && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
                )}
              </div>

              <div className="py-1">
                <Link
                  href="/app/profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-cyan-600 dark:hover:text-cyan-300 transition"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  {t('navigation.profile')}
                </Link>

                <Link
                  href="/app/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-cyan-600 dark:hover:text-cyan-300 transition"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  {t('navigation.settings')}
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/50 transition"
                  >
                    <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    {t('navigation.admin')}
                  </Link>
                )}
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 transition"
                >
                  <LogOut className="h-4 w-4 rtl-flip" />
                  {t('navigation.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
