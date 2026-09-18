'use client';

import React from 'react';
import { LucideIcon, FolderSearch, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  badgeText?: string;
}

export function EmptyState({
  icon: Icon = FolderSearch,
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
  badgeText,
}: EmptyStateProps) {
  return (
    <div className="relative overflow-hidden flex flex-col items-center justify-center py-12 px-6 text-center bg-slate-50 dark:bg-[#090e1c]/80 backdrop-blur-xl rounded-3xl border border-dashed border-slate-300 dark:border-slate-800/90 shadow-sm dark:shadow-xl">
      {/* Background ambient gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {badgeText && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-500/30 px-3 py-0.5 rounded-full mb-3 shadow-xs">
          <Sparkles className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
          {badgeText}
        </span>
      )}

      {/* Icon frame */}
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-gradient-to-tr dark:from-[#0d172e] dark:to-[#0a1120] text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 shadow-md shadow-cyan-950/10 dark:shadow-cyan-950/30 mb-4 group-hover:scale-105 transition">
        <Icon className="h-7 w-7" />
        <div className="absolute -inset-1 rounded-2xl bg-cyan-400/10 blur-xs -z-10" />
      </div>

      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1.5 max-w-md">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 dark:from-cyan-500 dark:to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 active:scale-98 rounded-xl shadow-md shadow-cyan-500/20 border border-cyan-400/30 transition"
        >
          {actionText}
        </Link>
      )}

      {actionText && onActionClick && !actionHref && (
        <button
          onClick={onActionClick}
          className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 active:scale-98 rounded-xl shadow-md shadow-cyan-500/20 border border-cyan-400/30 transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
