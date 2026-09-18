'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, GraduationCap, Clock, UserPlus, ShieldAlert, Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Profile, Skill, Interest } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/lib/i18n/context';
import { MatchBreakdown } from '@/lib/matching';
import { CompatibilityVisual } from '@/components/matching/CompatibilityVisual';

interface ProfileCardProps {
  profile: Profile & { skills?: Skill[]; interests?: Interest[] };
  onConnect?: (profileId: string) => void;
  onReport?: (profileId: string) => void;
  isPending?: boolean;
  isConnected?: boolean;
  matchBreakdown?: MatchBreakdown;
}

export function ProfileCard({
  profile,
  onConnect,
  onReport,
  isPending = false,
  isConnected = false,
  matchBreakdown,
}: ProfileCardProps) {
  const { t, isRtl } = useI18n();
  const [showMatchDetails, setShowMatchDetails] = useState(false);

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
    <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1322]/90 p-5 sm:p-6 shadow-sm dark:shadow-xl hover:border-cyan-500/40 hover:shadow-md dark:hover:shadow-2xl transition-all duration-300 backdrop-blur-xl">
      {/* Ambient background hover glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/10 transition duration-500" />

      <div>
        {/* Top Header: Avatar, Name, Location, Report */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar with status indicator */}
            <div className="relative shrink-0">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="h-14 w-14 rounded-2xl object-cover border-2 border-cyan-500/30 shadow-md shadow-cyan-950/40"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-indigo-600 text-white font-extrabold text-xl shadow-md border border-cyan-400/40">
                  {profile.display_name.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Active status pulse */}
              <span
                className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0c1322] shadow-[0_0_8px_#34d399]"
                title="Disponible"
              />
            </div>

            <div className="min-w-0 flex-1">
              <Link
                href={`/app/profile/${profile.id}`}
                className="font-bold text-base text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition truncate block tracking-tight"
              >
                {profile.display_name}
              </Link>

              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <MapPin className="h-3 w-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  {profile.city || 'Tunisie'}
                </span>
                {profile.experience_level && (
                  <>
                    <span className="text-slate-400 dark:text-slate-600">•</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">{profile.experience_level}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onReport && (
              <button
                onClick={() => onReport(profile.id)}
                className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition shrink-0"
                title={t('common.report') || 'Signaler'}
                aria-label="Signaler"
              >
                <ShieldAlert className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Compatibility badge if available */}
        {matchBreakdown && (
          <div className="mt-3">
            <button
              onClick={() => setShowMatchDetails(!showMatchDetails)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-500/20 hover:border-cyan-500/40 text-xs transition"
            >
              <div className="flex items-center gap-1.5 text-cyan-800 dark:text-cyan-300 font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                <span>{t('matching.compatibility') || 'Compatibilité'} :</span>
                <span className="font-mono text-cyan-700 dark:text-cyan-200 font-bold">{matchBreakdown.totalPercentage}%</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-cyan-700 dark:text-cyan-400 font-semibold">
                <span>{showMatchDetails ? t('common.close') || 'Fermer' : t('matching.viewFactors') || 'Détails'}</span>
                {showMatchDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </div>
            </button>

            {showMatchDetails && (
              <div className="mt-2.5 animate-fade-in">
                <CompatibilityVisual breakdown={matchBreakdown} />
              </div>
            )}
          </div>
        )}

        {/* University Track */}
        {profile.university && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#080e1e] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <GraduationCap className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span className="truncate font-medium">{profile.university}</span>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            {profile.bio}
          </p>
        )}

        {/* Goals */}
        {profile.collaboration_goals && profile.collaboration_goals.length > 0 && (
          <div className="mt-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 p-2.5 text-xs text-cyan-900 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-500/20">
            <span className="font-bold text-[10px] text-cyan-700 dark:text-cyan-400 uppercase tracking-wider block mb-0.5">
              {t('profile.goals') || 'Objectif recherché'}
            </span>
            <p className="line-clamp-1 font-medium">{profile.collaboration_goals.join(', ')}</p>
          </div>
        )}

        {/* Skills Tag Cloud */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="mt-3.5">
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.slice(0, 4).map((skill) => (
                <span
                  key={skill.id || skill.name}
                  className={`text-[11px] px-2.5 py-0.5 rounded-lg border font-medium transition ${getSkillCategoryClass(
                    skill.category
                  )}`}
                >
                  {skill.name}
                </span>
              ))}
              {profile.skills.length > 4 && (
                <span className="text-[11px] font-semibold text-slate-500 self-center px-1">
                  +{profile.skills.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{profile.availability || t('profile.flexible') || 'Flexible'}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/app/profile/${profile.id}`}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition"
          >
            {t('discovery.viewProfile')}
          </Link>

          {onConnect && (
            <button
              onClick={() => onConnect(profile.id)}
              disabled={isPending || isConnected}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition shadow-md ${
                isConnected
                  ? 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 cursor-default'
                  : isPending
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500/30 cursor-default'
                  : 'bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 dark:from-cyan-500 dark:to-indigo-600 text-white hover:from-cyan-500 hover:to-indigo-500 active:scale-98 shadow-cyan-500/20 border border-cyan-400/30'
              }`}
            >
              {isConnected ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  {t('connections.connected') || 'Connecté'}
                </>
              ) : isPending ? (
                t('connections.pending') || 'En attente'
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" />
                  {t('discovery.connect')}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
