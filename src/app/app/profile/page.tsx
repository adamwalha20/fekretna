'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  GraduationCap,
  Clock,
  Settings,
  FolderGit2,
  Share2,
  Loader2,
  Sparkles,
  Layers,
  Heart,
  Briefcase,
} from 'lucide-react';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { createClient } from '@/lib/supabase/client';
import { Profile, Skill, Interest, Project } from '@/types/database';
import { useI18n } from '@/lib/i18n/context';

export default function MyProfilePage() {
  const { t, isRtl } = useI18n();
  const [profile, setProfile] = useState<
    (Profile & { skills?: Skill[]; interests?: Interest[] }) | null
  >(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Load profile with skills and interests
        const { data: prof } = await supabase
          .from('profiles')
          .select('*, profile_skills(skills(*)), profile_interests(interests(*))')
          .eq('id', user.id)
          .maybeSingle();

        if (prof) {
          setProfile({
            ...prof,
            skills: prof.profile_skills?.map((ps: { skills: Skill }) => ps.skills).filter(Boolean) || [],
            interests: prof.profile_interests?.map((pi: { interests: Interest }) => pi.interests).filter(Boolean) || [],
          });
        }

        // Load user's projects
        const { data: projs } = await supabase
          .from('projects')
          .select('*, project_roles(*), project_skills(skills(*))')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });

        if (projs) setProjects(projs as unknown as Project[]);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleShare = () => {
    if (!profile) return;
    const url = `${window.location.origin}/app/profile/${profile.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getSkillCategoryClass = (category: string) => {
    switch (category) {
      case 'Technology':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30';
      case 'Business':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30';
      case 'Creative':
        return 'bg-purple-950/60 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-800/80 text-slate-300 border-slate-700/60';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16 text-slate-400">
        Profil non disponible. Veuillez compléter votre profil dans les paramètres.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Profile Header Card with futuristic glow */}
      <div className="rounded-3xl border border-slate-800/90 bg-[#0c1322]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="flex items-start gap-4">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="h-20 w-20 rounded-3xl object-cover border-2 border-cyan-400/40 shadow-xl shadow-cyan-950/40"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-extrabold text-3xl shadow-xl border border-cyan-400/40">
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {profile.display_name}
                </h1>
                {profile.experience_level && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
                    {profile.experience_level}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-cyan-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.city}
                </span>
                {profile.university && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <GraduationCap className="h-3.5 w-3.5 text-cyan-400" />
                      {profile.university}
                    </span>
                  </>
                )}
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  {profile.availability || t('profile.flexible') || 'Flexible'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-slate-700"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{copied ? 'Lien copié !' : t('common.share') || 'Partager'}</span>
            </button>

            <Link
              href="/app/settings"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-xl shadow-md shadow-cyan-500/20 border border-cyan-400/30 transition"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>{t('profile.editProfile') || 'Modifier mon profil'}</span>
            </Link>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="py-5 border-b border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t('profile.about') || 'À propos'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Goals */}
        {profile.collaboration_goals && profile.collaboration_goals.length > 0 && (
          <div className="py-5 border-b border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t('profile.goals') || 'Objectif recherché'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.collaboration_goals.map((goal, idx) => (
                <span
                  key={idx}
                  className="text-xs text-cyan-300 font-semibold bg-cyan-950/60 border border-cyan-500/30 px-3 py-1.5 rounded-xl"
                >
                  {goal}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Skills & Interests */}
        <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span>{t('profile.skills') || 'Compétences'}</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((s) => (
                  <span
                    key={s.id || s.name}
                    className={`text-xs px-2.5 py-1 rounded-xl font-medium border ${getSkillCategoryClass(
                      s.category
                    )}`}
                  >
                    {s.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">Aucune compétence ajoutée</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-indigo-400" />
              <span>{t('profile.interests') || 'Centres d’intérêt'}</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests && profile.interests.length > 0 ? (
                profile.interests.map((i) => (
                  <span
                    key={i.id || i.name}
                    className="text-xs px-2.5 py-1 rounded-xl font-medium bg-indigo-950/60 text-indigo-300 border border-indigo-500/30"
                  >
                    {i.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">Aucun intérêt spécifié</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User's Created Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-cyan-400" />
            <span>{t('profile.publishedProjects') || 'Mes projets publiés'} ({projects.length})</span>
          </h2>
          <Link
            href="/app/projects/new"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            + {t('projects.createProject') || 'Nouveau projet'}
          </Link>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <ProjectCard key={proj.id} project={proj} isOwner={true} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-800 bg-[#0c1322]/80 p-8 text-center text-xs text-slate-400">
            {t('dashboard.noPersonalProjectsDesc') || 'Vous n’avez pas encore publié de projet sur Fekretna.'}
          </div>
        )}
      </div>
    </div>
  );
}
