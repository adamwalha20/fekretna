'use client';

import React from 'react';
import { Heart, X, MapPin, GraduationCap, Clock, Sparkles } from 'lucide-react';
import { Profile, Skill, Interest } from '@/types/database';
import { useI18n } from '@/lib/i18n/context';

interface SwipeCardProps {
  profile: Profile & { skills?: Skill[]; interests?: Interest[] };
  onPass: () => void;
  onInterested: () => void;
}

export function SwipeCard({ profile, onPass, onInterested }: SwipeCardProps) {
  const { t, isRtl } = useI18n();

  const getSkillCategoryClass = (category: string) => {
    switch (category) {
      case 'Technology':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-500/30';
      case 'Business':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30';
      case 'Creative':
        return 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-500/30';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60';
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Background card stack illusion layers */}
      <div className="absolute inset-x-4 top-2 h-full rounded-3xl bg-slate-200/50 dark:bg-[#091020]/40 -z-10 transform scale-[0.96] translate-y-3 border border-slate-200 dark:border-slate-800/40" />
      <div className="absolute inset-x-2 top-1 h-full rounded-3xl bg-slate-100 dark:bg-[#0b1426]/70 -z-10 transform scale-[0.98] translate-y-1.5 border border-slate-200 dark:border-slate-800/60" />

      {/* Main Front Card */}
      <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0d172e]/95 p-6 sm:p-7 shadow-xl dark:shadow-2xl shadow-cyan-950/10 dark:shadow-cyan-950/30 transition-all z-10 backdrop-blur-xl">
        {/* Top Banner / Avatar */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="relative mb-3.5">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="h-24 w-24 rounded-2xl object-cover border-2 border-cyan-400/40 shadow-xl shadow-cyan-950/20"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-indigo-600 text-white font-extrabold text-3xl shadow-xl border border-cyan-400/40">
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0d172e] shadow-[0_0_8px_#34d399]"
              title="Disponible"
            />
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {profile.display_name}
          </h3>

          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 font-semibold text-cyan-600 dark:text-cyan-400">
              <MapPin className="h-3.5 w-3.5" />
              {profile.city || 'Tunisie'}
            </span>
            {profile.experience_level && (
              <>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">{profile.experience_level}</span>
              </>
            )}
          </div>

          {profile.university && (
            <p className="flex items-center gap-1.5 mt-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#080e1e] px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
              <GraduationCap className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span className="truncate">{profile.university}</span>
            </p>
          )}
        </div>

        {/* Body Details */}
        <div className="py-4 space-y-3.5">
          {profile.bio && (
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed text-center italic bg-slate-50 dark:bg-[#080e1e] p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              &ldquo;{profile.bio}&rdquo;
            </p>
          )}

          {/* Goals */}
          {profile.collaboration_goals && profile.collaboration_goals.length > 0 && (
            <div className="rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 p-3 text-xs text-cyan-900 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-500/20">
              <span className="font-bold text-[10px] text-cyan-700 dark:text-cyan-400 uppercase tracking-wider block mb-0.5">
                {t('profile.goals') || 'Objectif recherché :'}
              </span>
              <p className="font-medium">{profile.collaboration_goals.join(', ')}</p>
            </div>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                {t('profile.skills') || 'Compétences clés'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((s) => (
                  <span
                    key={s.id || s.name}
                    className={`text-[11px] px-2.5 py-0.5 rounded-lg border font-medium ${getSkillCategoryClass(
                      s.category
                    )}`}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="inline-flex items-center gap-1 font-medium">
              <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              {profile.availability || 'Disponibilité flexible'}
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{profile.collaboration_format || 'Hybride'}</span>
          </div>
        </div>

        {/* Swipe Action Controls */}
        <div className="flex items-center justify-center gap-8 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={onPass}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-300 active:scale-95 transition shadow-md"
            aria-label={t('common.pass') || 'Passer'}
            title={t('common.pass') || 'Passer au suivant'}
          >
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={onInterested}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white hover:scale-105 active:scale-95 transition shadow-lg shadow-cyan-500/30 border border-cyan-400/40"
            aria-label={t('common.interested') || 'Intéressé(e)'}
            title={t('common.interested') || 'Exprimer un intérêt'}
          >
            <Heart className="h-7 w-7 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
