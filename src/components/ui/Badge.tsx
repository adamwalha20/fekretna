import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'info' | 'purple' | 'cyan' | 'orange' | 'idea';
  size?: 'xs' | 'sm' | 'md';
  withDot?: boolean;
}

export function Badge({
  children,
  className,
  variant = 'secondary',
  size = 'md',
  withDot = false,
  ...props
}: BadgeProps) {
  const variantStyles = {
    primary: 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-500/30',
    secondary: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60',
    outline: 'border-slate-300 text-slate-700 bg-white/60 dark:border-slate-700 dark:text-slate-300 dark:bg-slate-900/60 backdrop-blur-xs',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30',
    info: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-500/30',
    purple: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-500/30',
    cyan: 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-500/30',
    orange: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-500/30',
    idea: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-500/30 shadow-xs dark:shadow-orange-950/30',
  };

  const dotColors = {
    primary: 'bg-cyan-500',
    secondary: 'bg-slate-400 dark:bg-slate-500',
    outline: 'bg-slate-500 dark:bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    info: 'bg-sky-500',
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500',
    orange: 'bg-orange-500',
    idea: 'bg-orange-500',
  };

  const sizeStyles = {
    xs: 'text-[10px] font-semibold px-2 py-0.5 gap-1',
    sm: 'text-[11px] font-semibold px-2.5 py-0.5 gap-1.5',
    md: 'text-xs font-semibold px-3 py-1 gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border transition-all select-none shadow-2xs',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {withDot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0 animate-pulse', dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
