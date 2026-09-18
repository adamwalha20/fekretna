'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, ArrowUpRight, ShieldAlert, Users, Rocket, Clock } from 'lucide-react';
import { Project, Skill, ProjectRole } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';

interface ProjectCardProps {
  project: Project & { skills?: Skill[]; roles?: ProjectRole[] };
  onApply?: (projectId: string) => void;
  onReport?: (projectId: string) => void;
  hasApplied?: boolean;
  isOwner?: boolean;
}

export function ProjectCard({
  project,
  onApply,
  onReport,
  hasApplied = false,
  isOwner = false,
}: ProjectCardProps) {
  const { t, isRtl } = useI18n();

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Idea':
        return 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-500/30';
      case 'Validation':
        return 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-500/30';
      case 'Prototype':
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30';
      case 'MVP':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-500/30';
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30';
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1322]/90 p-5 sm:p-6 shadow-sm dark:shadow-xl hover:border-cyan-500/40 hover:shadow-md dark:hover:shadow-2xl transition-all duration-300 backdrop-blur-xl">
      {/* Subtle ambient light on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/10 transition duration-500" />

      <div>
        {/* Top Badges & Stage */}
        <div className="flex items-start justify-between gap-2 mb-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 dark:bg-cyan-950/70 dark:border-cyan-500/30 dark:text-cyan-300 font-semibold">
              {project.category}
            </span>
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold flex items-center gap-1.5 ${getStageColor(
                project.stage
              )}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              {project.stage}
            </span>
          </div>

          {onReport && !isOwner && (
            <button
              onClick={() => onReport(project.id)}
              className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition shrink-0"
              title={t('common.report') || 'Signaler'}
              aria-label="Signaler"
            >
              <ShieldAlert className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Project Title */}
        <Link
          href={`/app/projects/${project.id}`}
          className="group/title block mb-2"
        >
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover/title:text-cyan-600 dark:group-hover/title:text-cyan-300 transition line-clamp-1 tracking-tight">
            {project.title}
          </h3>
        </Link>

        {/* Meta Info: City, Format, Commitment */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
            <MapPin className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            {project.city}
          </span>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{project.collaboration_format}</span>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <span className="truncate text-slate-500 dark:text-slate-400">{project.commitment_expectation}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3.5">
          {project.description}
        </p>

        {/* Problem solved block */}
        {project.problem_description && (
          <div className="rounded-2xl bg-slate-50 dark:bg-[#080e1e] p-3 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 mb-3.5">
            <span className="font-bold text-[10px] text-cyan-700 dark:text-cyan-400 uppercase tracking-wider block mb-0.5">
              {t('projects.targetProblem') || 'Problème ciblé :'}
            </span>
            <p className="line-clamp-1 text-slate-700 dark:text-slate-300">{project.problem_description}</p>
          </div>
        )}

        {/* Roles needed capsules */}
        {project.roles && project.roles.length > 0 && (
          <div className="mb-3.5">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Users className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
              {t('projects.requiredRoles') || 'Rôles recherchés'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.roles.map((r) => (
                <span
                  key={r.id}
                  className={`text-[11px] px-2.5 py-1 rounded-xl font-medium border transition ${
                    r.filled
                      ? 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-900 dark:text-slate-600 dark:border-slate-800 line-through'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30'
                  }`}
                >
                  {r.role_name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Skills sought */}
        {project.skills && project.skills.length > 0 && (
          <div>
            <div className="flex flex-wrap gap-1.5">
              {project.skills.slice(0, 3).map((s) => (
                <span
                  key={s.id}
                  className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 font-medium"
                >
                  {s.name}
                </span>
              ))}
              {project.skills.length > 3 && (
                <span className="text-[11px] font-semibold text-slate-500 self-center px-1">
                  +{project.skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(project.created_at)}
        </span>

        <div className="flex items-center gap-2">
          <Link
            href={`/app/projects/${project.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 transition"
          >
            {t('common.details') || 'Détails'}
            <ArrowUpRight className="h-3 w-3 rtl-flip" />
          </Link>

          {isOwner ? (
            <Link
              href={`/app/projects/${project.id}`}
              className="px-3 py-1.5 text-xs font-semibold text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-500/30 rounded-xl transition"
            >
              {t('common.manage') || 'Gérer'}
            </Link>
          ) : onApply ? (
            <button
              onClick={() => onApply(project.id)}
              disabled={hasApplied}
              className={`inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition shadow-md ${
                hasApplied
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 cursor-default'
                  : 'bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 dark:from-cyan-500 dark:to-indigo-600 text-white hover:from-cyan-500 hover:to-indigo-500 active:scale-98 shadow-cyan-500/20 border border-cyan-400/30'
              }`}
            >
              {hasApplied ? (t('projects.applied') || 'Candidature envoyée') : t('discovery.apply')}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
