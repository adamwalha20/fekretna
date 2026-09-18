'use client';

import React from 'react';
import { MatchBreakdown } from '@/lib/matching';
import { useI18n } from '@/lib/i18n/context';
import { Sparkles, MapPin, Target, BookOpen, Layers } from 'lucide-react';

interface CompatibilityVisualProps {
  breakdown: MatchBreakdown;
  compact?: boolean;
}

export function CompatibilityVisual({ breakdown, compact = false }: CompatibilityVisualProps) {
  const { t } = useI18n();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-cyan-400 border-cyan-500/40 shadow-cyan-500/20';
    if (score >= 60) return 'text-teal-400 border-teal-500/40 shadow-teal-500/20';
    return 'text-indigo-400 border-indigo-500/40 shadow-indigo-500/20';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#080e1e] border border-cyan-500/30 text-xs shadow-xs">
        <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
        <span className="font-extrabold text-cyan-300 font-mono">
          {breakdown.totalPercentage}%
        </span>
        <span className="text-[10px] text-slate-400 font-medium">
          {t('matching.synergy') || 'Synergie'}
        </span>
      </div>
    );
  }

  const factors = [
    {
      label: t('matching.skills') || 'Compétences',
      score: breakdown.skillsScore,
      icon: Layers,
      barClass: 'from-cyan-500 to-blue-500',
    },
    {
      label: t('matching.interests') || 'Intérêts',
      score: breakdown.interestsScore,
      icon: BookOpen,
      barClass: 'from-indigo-500 to-purple-500',
    },
    {
      label: t('matching.goals') || 'Objectifs',
      score: breakdown.goalsScore,
      icon: Target,
      barClass: 'from-emerald-500 to-teal-400',
    },
    {
      label: t('matching.location') || 'Localisation',
      score: breakdown.locationScore,
      icon: MapPin,
      barClass: 'from-cyan-400 to-teal-500',
    },
  ];

  return (
    <div className="rounded-2xl bg-[#080e1e]/90 border border-cyan-500/30 p-4 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Header with Percentage */}
      <div className="flex items-center justify-between gap-3 mb-3 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t('matching.compatibilityTitle') || 'Indice de compatibilité'}
            </p>
            <p className="text-[10px] text-slate-500">
              {t('matching.calculatedBreakdown') || 'Calculé selon la complémentarité de profil'}
            </p>
          </div>
        </div>

        <div
          className={`flex items-center justify-center px-3 py-1 rounded-xl bg-[#0d172e] border font-mono font-extrabold text-sm shadow-md ${getScoreColor(
            breakdown.totalPercentage
          )}`}
        >
          {breakdown.totalPercentage}%
        </div>
      </div>

      {/* Futuristic Progress Bars */}
      <div className="space-y-2.5">
        {factors.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.label} className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Icon className="h-3 w-3 text-slate-400" />
                  <span>{f.label}</span>
                </span>
                <span className="font-mono text-slate-400 text-[10px]">
                  {f.score}%
                </span>
              </div>

              {/* Bar track */}
              <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden relative">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${f.barClass} transition-all duration-700 ease-out`}
                  style={{ width: `${Math.max(6, f.score)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {breakdown.sharedInterests.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-slate-400 font-medium">
            {t('matching.sharedThemes') || 'Sujets communs :'}
          </span>
          {breakdown.sharedInterests.map((interest) => (
            <span
              key={interest}
              className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 font-medium"
            >
              {interest}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
