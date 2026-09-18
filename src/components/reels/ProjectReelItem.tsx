'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  MessageSquare, 
  UserPlus, 
  Lightbulb, 
  Handshake, 
  ExternalLink, 
  MapPin, 
  Briefcase, 
  Layers, 
  Share2,
  Check
} from 'lucide-react';
import { Project } from '@/types/database';
import { ProjectReelVisual } from './ProjectReelVisual';
import { useI18n } from '@/lib/i18n/context';

interface ProjectReelItemProps {
  project: Project;
  currentUserId?: string | null;
  onToggleLike: (projectId: string) => Promise<void>;
  onOpenComments: (project: Project) => void;
  onOpenConnect: (project: Project) => void;
  onOpenAdvice: (project: Project) => void;
  onOpenCollaborate: (project: Project) => void;
}

export function ProjectReelItem({
  project,
  currentUserId,
  onToggleLike,
  onOpenComments,
  onOpenConnect,
  onOpenAdvice,
  onOpenCollaborate,
}: ProjectReelItemProps) {
  const { t, isRtl } = useI18n();
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isLiked = !!project.has_liked;
  const likesCount = project.likes_count || 0;
  const commentsCount = project.comments_count || 0;

  const handleLikeClick = async () => {
    setLikeAnimating(true);
    await onToggleLike(project.id);
    setTimeout(() => setLikeAnimating(false), 600);
  };

  const handleShareClick = async () => {
    const url = `${window.location.origin}/app/projects/${project.id}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const owner = project.owner;
  const ownerName = owner?.display_name || 'Fondateur Fekretna';
  const ownerUsername = owner?.username ? `@${owner.username}` : `@${ownerName.toLowerCase().replace(/\s+/g, '')}`;

  return (
    <div className="relative w-full h-[calc(100vh-5.5rem)] md:h-[calc(100vh-6rem)] max-w-4xl mx-auto flex items-center justify-center p-2 sm:p-4 snap-start shrink-0">
      {/* Centered Reel Card Frame */}
      <div className="reel-card relative w-full h-full max-h-[820px] max-w-md md:max-w-xl rounded-3xl overflow-hidden border border-slate-800/80 bg-[#080d1a] shadow-2xl shadow-cyan-950/40 flex flex-col justify-between backdrop-blur-xl">
        {/* Background Visual Element */}
        <div className="absolute inset-0 z-0">
          <ProjectReelVisual
            title={project.title}
            category={project.category}
            stage={project.stage}
            imageUrl={project.image_url}
          />
        </div>

        {/* Ambient Top Bar with Badges */}
        <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 shadow-sm backdrop-blur-md">
              {project.stage || 'Projet'}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900/80 border border-slate-700/60 text-slate-300 backdrop-blur-md flex items-center gap-1">
              <Layers className="h-3 w-3 text-indigo-400" />
              <span>{project.category}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleShareClick}
            title="Partager le lien du projet"
            className="p-2 rounded-2xl bg-slate-900/70 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white backdrop-blur-md transition shadow-md"
          >
            {copiedLink ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Bottom Section: Project Meta & Side Action Bar */}
        <div className="relative z-10 p-4 sm:p-6 flex items-end justify-between gap-3 pointer-events-auto">
          {/* Left Column: Project Name, Owner, Excerpt, Skills & Collaborate CTA */}
          <div className="flex-1 min-w-0 text-white space-y-2.5 pr-2">
            {/* Owner preview pill */}
            {owner && (
              <Link
                href={`/app/profile/${owner.id}`}
                className="inline-flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 backdrop-blur-md transition group"
              >
                {owner.avatar_url ? (
                  <img
                    src={owner.avatar_url}
                    alt={ownerName}
                    className="h-7 w-7 rounded-full object-cover border border-cyan-400/40"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white">
                    {ownerName[0]?.toUpperCase()}
                  </div>
                )}
                <div className="text-left">
                  <span className="block text-xs font-bold text-white group-hover:text-cyan-300 transition leading-tight">
                    {ownerName}
                  </span>
                  <span className="block text-[10px] text-slate-400 leading-none">
                    {ownerUsername}
                  </span>
                </div>
              </Link>
            )}

            {/* Project Title */}
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
              {project.title}
            </h2>

            {/* Project Location & Format */}
            <div className="flex items-center gap-3 text-[11px] text-slate-300">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-cyan-400" />
                <span>{project.city || 'Tunisie'}</span>
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3 text-indigo-400" />
                <span>{project.collaboration_format || 'Flexible'}</span>
              </span>
            </div>

            {/* Project Description excerpt */}
            <div className="text-xs sm:text-sm text-slate-200/95 leading-relaxed drop-shadow">
              <p className={expandedDesc ? '' : 'line-clamp-2'}>
                {project.problem_description || project.description}
              </p>
              {(project.problem_description || project.description).length > 110 && (
                <button
                  type="button"
                  onClick={() => setExpandedDesc(!expandedDesc)}
                  className="text-cyan-400 hover:text-cyan-300 text-xs font-bold mt-1 underline underline-offset-2"
                >
                  {expandedDesc
                    ? t('reels.showLess') || 'Voir moins'
                    : t('reels.showMore') || 'Voir plus'}
                </button>
              )}
            </div>

            {/* Project Skills */}
            {project.skills && project.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {project.skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill.id}
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-cyan-200 backdrop-blur-md"
                  >
                    #{skill.name}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom Row Action: Collaborate & View Full Project */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => onOpenCollaborate(project)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 border border-cyan-400/40 transition active:scale-95"
              >
                <Handshake className="h-4 w-4" />
                <span>{t('reels.collaborate') || 'Collaborer'}</span>
              </button>

              <Link
                href={`/app/projects/${project.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/70 backdrop-blur-md transition"
              >
                <span>{t('reels.viewProject') || 'Voir le projet'}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Action Bar (Reel controls) */}
          <div className="flex flex-col items-center gap-3 shrink-0 py-2">
            {/* Like button */}
            <button
              type="button"
              onClick={handleLikeClick}
              className="flex flex-col items-center group"
              aria-label={t('reels.like')}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300 ${
                  isLiked
                    ? 'bg-rose-950/80 border-rose-500/60 text-rose-500 shadow-lg shadow-rose-500/20'
                    : 'bg-slate-900/80 border-slate-700/70 text-slate-300 group-hover:text-rose-400 group-hover:border-slate-600 backdrop-blur-md'
                } ${likeAnimating ? 'scale-125' : 'scale-100'}`}
              >
                <Heart
                  className={`h-5 w-5 transition-transform ${
                    isLiked ? 'fill-rose-500 stroke-rose-500' : ''
                  }`}
                />
              </div>
              <span className="text-[11px] font-bold text-slate-300 mt-1 drop-shadow">
                {likesCount}
              </span>
            </button>

            {/* Comment button */}
            <button
              type="button"
              onClick={() => onOpenComments(project)}
              className="flex flex-col items-center group"
              aria-label={t('reels.comment')}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/80 border border-slate-700/70 text-slate-300 group-hover:text-cyan-400 group-hover:border-cyan-500/40 backdrop-blur-md transition shadow-md">
                <MessageSquare className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-300 mt-1 drop-shadow">
                {commentsCount}
              </span>
            </button>

            {/* Give Advice button (Lightbulb) */}
            <button
              type="button"
              onClick={() => onOpenAdvice(project)}
              className="flex flex-col items-center group"
              aria-label={t('reels.giveAdvice')}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-400 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-amber-500/20 backdrop-blur-md transition">
                <Lightbulb className="h-5 w-5 fill-amber-400/20" />
              </div>
              <span className="text-[10px] font-semibold text-amber-300 mt-1 drop-shadow text-center max-w-[45px] leading-tight">
                {t('reels.giveAdvice') || 'Conseil'}
              </span>
            </button>

            {/* Connect button */}
            <button
              type="button"
              onClick={() => onOpenConnect(project)}
              className="flex flex-col items-center group"
              aria-label={t('reels.connect')}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-cyan-500/20 backdrop-blur-md transition">
                <UserPlus className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-semibold text-cyan-300 mt-1 drop-shadow text-center max-w-[45px] leading-tight">
                {t('reels.connect') || 'Tisser'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
