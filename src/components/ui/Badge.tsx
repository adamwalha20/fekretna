import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'info' | 'purple' | 'cyan';
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
    primary: 'bg-teal-50 text-teal-700 border-teal-200/80',
    secondary: 'bg-slate-100 text-slate-700 border-slate-200/80',
    outline: 'border-slate-300/80 text-slate-700 bg-white/50 backdrop-blur-xs',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    info: 'bg-sky-50 text-sky-700 border-sky-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
  };

  const dotColors = {
    primary: 'bg-teal-500',
    secondary: 'bg-slate-400',
    outline: 'bg-slate-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    info: 'bg-sky-500',
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500',
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
