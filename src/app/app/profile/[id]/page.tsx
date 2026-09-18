'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  GraduationCap,
  Clock,
  UserPlus,
  ShieldAlert,
  Ban,
  ArrowLeft,
  FolderGit2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { ConnectModal } from '@/components/modals/ConnectModal';
import { ReportModal } from '@/components/modals/ReportModal';
import { createClient } from '@/lib/supabase/client';
import { Profile, Skill, Interest, Project, ReportReason } from '@/types/database';

interface OtherProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function OtherProfilePage({ params }: OtherProfilePageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<
    (Profile & { skills?: Skill[]; interests?: Interest[] }) | null
  >(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          if (user.id === id) {
            router.push('/app/profile');
            return;
          }

          // Check connection status
          const { data: conn } = await supabase
            .from('connection_requests')
            .select('status, sender_id')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${user.id})`)
            .maybeSingle();

          if (conn?.status === 'accepted') setIsConnected(true);
          if (conn?.status === 'pending') setIsPending(true);
        }

        // Fetch target profile
        const { data: prof } = await supabase
          .from('profiles')
          .select('*, profile_skills(skills(*)), profile_interests(interests(*))')
          .eq('id', id)
          .single();

        if (prof) {
          setProfile({
            ...prof,
            skills: prof.profile_skills?.map((ps: { skills: Skill }) => ps.skills) || [],
            interests: prof.profile_interests?.map((pi: { interests: Interest }) => pi.interests) || [],
          });
        }

        // Fetch their public projects
        const { data: projs } = await supabase
          .from('projects')
          .select('*, project_roles(*), project_skills(skills(*))')
          .eq('owner_id', id)
          .eq('visibility', 'public')
          .eq('status', 'active');

        if (projs) setProjects(projs as unknown as Project[]);
      } catch (err) {
        console.error('Error loading other profile:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  const handleConnect = async (message: string) => {
    if (!currentUserId || !profile) return;
    const supabase = createClient();
    const { error } = await supabase.from('connection_requests').insert({
      sender_id: currentUserId,
      receiver_id: profile.id,
      message,
      status: 'pending',
    });

    if (error) throw error;

    await supabase.from('notifications').insert({
      user_id: profile.id,
      type: 'connection_request',
      title: 'Nouvelle demande de connexion',
      body: `Un membre souhaite se connecter avec vous sur Fekretna.`,
      related_entity_id: currentUserId,
    });

    setIsPending(true);
    showToast(`Demande de connexion envoyée à ${profile.display_name} !`);
  };

  const handleBlockUser = async () => {
    if (!currentUserId || !profile) return;
    if (
      !confirm(
        `Êtes-vous sûr de vouloir bloquer ${profile.display_name} ? Vous ne verrez plus ses projets ni ses messages.`
      )
    ) {
      return;
    }

    const supabase = createClient();
    try {
      const { error } = await supabase.from('blocks').insert({
        blocker_id: currentUserId,
        blocked_id: profile.id,
      });

      if (error) throw error;
      alert('Utilisateur bloqué.');
      router.push('/app/discover');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleReport = async (reason: ReportReason, description: string) => {
    if (!currentUserId || !profile) return;
    const supabase = createClient();
    const { error } = await supabase.from('reports').insert({
      reporter_id: currentUserId,
      reported_user_id: profile.id,
      reason,
      description,
      status: 'pending',
    });

    if (error) throw error;
    showToast('Signalement transmis à la modération.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16 text-slate-500">
        Profil introuvable ou masqué par son propriétaire.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-teal-600 text-white px-4 py-3 shadow-xl flex items-center gap-2 text-sm font-medium animate-bounce">
          <Sparkles className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      <Link
        href="/app/discover"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-teal-600 transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour à la découverte
      </Link>

      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="h-20 w-20 rounded-3xl object-cover border-2 border-teal-100 shadow-sm"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-bold text-3xl shadow-sm">
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {profile.display_name}
                </h1>
                {profile.experience_level && (
                  <Badge variant="primary" size="sm">
                    {profile.experience_level}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-teal-600" />
                  {profile.city}
                </span>
                {profile.university && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {profile.university}
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {profile.availability || 'Flexible'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setConnectModalOpen(true)}
              disabled={isConnected || isPending}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl shadow-sm transition ${
                isConnected
                  ? 'bg-slate-100 text-slate-500 cursor-default'
                  : isPending
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-default'
                  : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              {isConnected
                ? 'Connecté'
                : isPending
                ? 'Demande envoyée'
                : 'Se connecter'}
            </button>

            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-50 transition"
              title="Signaler le profil"
            >
              <ShieldAlert className="h-4 w-4" />
            </button>

            <button
              onClick={handleBlockUser}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-50 transition"
              title="Bloquer cet utilisateur"
            >
              <Ban className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="py-5 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              À propos
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Goals */}
        {profile.collaboration_goals && profile.collaboration_goals.length > 0 && (
          <div className="py-5 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Objectif recherché
            </h3>
            <p className="text-xs sm:text-sm text-teal-900 font-medium bg-teal-50/70 p-3 rounded-xl border border-teal-100">
              {profile.collaboration_goals.join(', ')}
            </p>
          </div>
        )}

        {/* Skills & Interests */}
        <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Compétences
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills?.map((s) => (
                <Badge key={s.id || s.name} variant="primary" size="sm">
                  {s.name}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Centres d&apos;intérêt
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests?.map((i) => (
                <Badge key={i.id || i.name} variant="secondary" size="sm">
                  {i.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Projects Created By This User */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FolderGit2 className="h-5 w-5 text-teal-600" />
          Projets publiés par {profile.display_name} ({projects.length})
        </h2>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <ProjectCard key={proj.id} project={proj} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            Cet utilisateur n&apos;a pas encore de projet public.
          </p>
        )}
      </div>

      {/* Modals */}
      <ConnectModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        targetName={profile.display_name}
        onSubmit={handleConnect}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="utilisateur"
        targetId={profile.id}
        onSubmit={handleReport}
      />
    </div>
  );
}
