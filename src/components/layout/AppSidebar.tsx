'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  Lightbulb,
  FolderGit2,
  Users,
  MessageSquare,
  User,
  Settings,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';

interface AppSidebarProps {
  isAdmin?: boolean;
}

export function AppSidebar({ isAdmin = false }: AppSidebarProps) {
  const pathname = usePathname();
  const { t, isRtl } = useI18n();

  const links = [
    {
      href: '/app',
      label: t('navigation.dashboard'),
      icon: LayoutDashboard,
      active: pathname === '/app',
    },
    {
      href: '/app/discover',
      label: t('navigation.discover'),
      icon: Sparkles,
      active: pathname.startsWith('/app/discover') && !pathname.startsWith('/app/discover/reels'),
    },
    {
      href: '/app/ideas',
      label: t('navigation.ideas') || 'Idées',
      icon: Lightbulb,
      active: pathname.startsWith('/app/ideas') || pathname.startsWith('/app/discover/reels') || pathname.startsWith('/discover/reels'),
    },
    {
      href: '/app/projects',
      label: t('navigation.projects'),
      icon: FolderGit2,
      active: pathname.startsWith('/app/projects'),
    },
    {
      href: '/app/connections',
      label: t('navigation.connections'),
      icon: Users,
      active: pathname.startsWith('/app/connections'),
    },
    {
      href: '/app/messages',
      label: t('navigation.messages'),
      icon: MessageSquare,
      active: pathname.startsWith('/app/messages'),
    },
    {
      href: '/app/profile',
      label: t('navigation.profile'),
      icon: User,
      active: pathname === '/app/profile',
    },
    {
      href: '/app/settings',
      label: t('navigation.settings'),
      icon: Settings,
      active: pathname.startsWith('/app/settings'),
    },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#080d1a]/70 backdrop-blur-xl p-4 transition-colors">
      <div className="flex-1 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                link.active
                  ? 'bg-cyan-50 text-cyan-800 border border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 font-semibold dark:border-cyan-500/30 shadow-xs dark:shadow-lg dark:shadow-cyan-500/10'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-950 dark:hover:text-slate-100 hover:border-slate-200 dark:hover:border-slate-700/50 border border-transparent'
              )}
            >
              {link.active && (
                <span
                  className={cn(
                    'absolute h-5 w-1 rounded-full bg-gradient-to-b from-cyan-500 to-indigo-600 shadow-sm shadow-cyan-400',
                    isRtl ? 'right-1' : 'left-1'
                  )}
                />
              )}
              <Icon
                className={cn(
                  'h-4.5 w-4.5 transition-colors duration-200',
                  link.active
                    ? link.href === '/app/ideas'
                      ? 'text-orange-500 dark:text-orange-400'
                      : 'text-cyan-600 dark:text-cyan-400'
                    : link.href === '/app/ideas'
                    ? 'text-orange-400/80 group-hover:text-orange-500'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-slate-300'
                )}
              />
              <span className="flex-1">{link.label}</span>
              {link.href === '/app/ideas' && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30">
                  Reels
                </span>
              )}
            </Link>
          );
        })}

        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800/80">
            <Link
              href="/admin"
              className={cn(
                'group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                pathname.startsWith('/admin')
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 font-semibold dark:border-amber-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-amber-50/50 dark:hover:bg-slate-800/50 hover:text-amber-700 dark:hover:text-amber-300'
              )}
            >
              <Shield className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
              <span>{t('navigation.admin')}</span>
            </Link>
          </div>
        )}
      </div>

      {/* Futuristic Tunisian Startup Ecosystem card */}
      <div className="rounded-2xl bg-slate-50 dark:bg-gradient-to-br dark:from-[#0d172a] dark:to-[#0a1120] p-4 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/90 shadow-sm dark:shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl -z-10 group-hover:bg-cyan-500/20 transition-all duration-500" />
        <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-wide">Écosystème Tunisie</span>
        </div>
        <p className="text-[11px] mt-1.5 text-slate-500 dark:text-slate-400 font-arabic leading-relaxed">
          من فكرة لفريق • تونس & الأقاليم
        </p>
      </div>
    </aside>
  );
}
