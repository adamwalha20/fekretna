'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Sparkles, Lightbulb, FolderGit2, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();

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
  ];

  return (
    <nav className="md:hidden fixed bottom-3 inset-x-3 z-40 mx-auto max-w-md flex items-center justify-around rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-[#080d1a]/90 px-1.5 py-1.5 shadow-xl dark:shadow-2xl shadow-slate-900/10 dark:shadow-cyan-950/40 backdrop-blur-xl transition-all">
      {links.map((link) => {
        const Icon = link.icon;
        const isIdea = link.href === '/app/ideas';
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center rounded-xl py-1.5 text-[10px] font-medium transition-all duration-200 active:scale-95',
              link.active
                ? isIdea
                  ? 'bg-orange-50 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 font-semibold shadow-inner border border-orange-200 dark:border-orange-500/30'
                  : 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 font-semibold shadow-inner border border-cyan-200 dark:border-cyan-500/30'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5 transition-transform duration-200',
                link.active
                  ? isIdea
                    ? 'scale-110 text-orange-600 dark:text-orange-400 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]'
                    : 'scale-110 text-cyan-600 dark:text-cyan-400 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                  : isIdea
                  ? 'text-orange-400/80 dark:text-orange-400/70'
                  : 'text-slate-500 dark:text-slate-400'
              )}
            />
            <span className="mt-0.5 tracking-tight truncate max-w-[60px]">{link.label}</span>
            {link.active && (
              <span
                className={cn(
                  'absolute -top-0.5 h-1 w-1 rounded-full',
                  isIdea
                    ? 'bg-orange-500 shadow-[0_0_6px_#f97316]'
                    : 'bg-cyan-600 dark:bg-cyan-400 shadow-[0_0_6px_#0284c7] dark:shadow-[0_0_6px_#22d3ee]'
                )}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
