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
    <nav className="md:hidden fixed bottom-3 inset-x-3 z-40 mx-auto max-w-md flex items-center justify-around rounded-2xl border border-slate-800/80 bg-[#080d1a]/90 px-1.5 py-1.5 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl transition-all">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center rounded-xl py-1.5 text-[10px] font-medium transition-all duration-200 active:scale-95',
              link.active
                ? 'bg-cyan-950/70 text-cyan-300 font-semibold shadow-inner border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5 transition-transform duration-200',
                link.active ? 'scale-110 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'text-slate-400'
              )}
            />
            <span className="mt-0.5 tracking-tight truncate max-w-[60px]">{link.label}</span>
            {link.active && (
              <span className="absolute -top-0.5 h-1 w-1 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
