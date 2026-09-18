'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  FolderGit2,
  Sparkles,
  Plus,
  ArrowRight,
  UserCheck,
  Clock,
  Compass,
  Check,
  X,
} from 'lucide-react';
import { Profile, Project, Skill, Interest, ConnectionRequest, ProjectRole } from '@/types/database';
import { MatchBreakdown } from '@/lib/matching';
import { ProfileCard } from '@/components/cards/ProfileCard';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useI18n } from '@/lib/i18n/context';
import { createClient } from '@/lib/supabase/client';
import confetti from 'canvas-confetti';

interface DashboardClientViewProps {
  currentProfile: Profile & { skills?: Skill[]; interests?: Interest[] };
  pendingRequests: (ConnectionRequest & { sender: Profile })[];
  activeConnectionsCount: number;
  myProjects: (Project & { skills?: Skill[]; roles?: ProjectRole[] })[];
  publicProjects: (Project & { skills?: Skill[]; roles?: ProjectRole[] })[];
  recommendedPeople: {
    profile: Profile & { skills?: Skill[]; interests?: Interest[] };
    breakdown: MatchBreakdown;
  }[];
}

export function DashboardClientView({
  currentProfile,
  pendingRequests: initialPendingRequests,
  activeConnectionsCount,
  myProjects,
  publicProjects,
  recommendedPeople,
}: DashboardClientViewProps) {
  const { t, isRtl } = useI18n();
  const [pendingRequests, setPendingRequests] = useState(initialPendingRequests);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAcceptRequest = async (requestId: string, senderId: string, senderName: string) => {
    try {
      const supabase = createClient();
      const { error: updateErr } = await supabase
        .from('connection_requests')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (updateErr) throw updateErr;

      // Create or find conversation
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({})
        .select('id')
        .single();

      if (newConv && currentProfile.id) {
        await supabase.from('conversation_members').insert([
          { conversation_id: newConv.id, user_id: currentProfile.id },
          { conversation_id: newConv.id, user_id: senderId },
        ]);
      }

      await supabase.from('notifications').insert({
        user_id: senderId,
        type: 'connection_accepted',
        title: 'Demande de connexion acceptée ! 🎉',
        body: `${currentProfile.display_name} a accepté votre demande. Vous pouvez maintenant discuter.`,
        related_entity_id: requestId,
      });

      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } catch {
        // fallback
      }

      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      showToast(`Connexion acceptée avec ${senderName} !`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const supabase = createClient();
      await supabase
        .from('connection_requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      showToast('Demande refusée.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleConnectProfile = async (profileId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('connection_requests').insert({
        sender_id: currentProfile.id,
        receiver_id: profileId,
        message: 'Bonjour ! Votre profil correspond beaucoup à ce que je recherche sur Fekretna. Connectons-nous !',
      });

      if (error) throw error;
      showToast('Demande de connexion envoyée !');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <div className="space-y-10 pb-12 animate-fade-in">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white px-5 py-3 shadow-2xl flex items-center gap-2.5 text-sm font-semibold border border-cyan-400/40 animate-bounce">
          <Sparkles className="h-4 w-4 text-cyan-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d172e] via-[#091122] to-[#070a13] p-6 sm:p-8 border border-slate-800/90 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
              <span>{t('dashboard.activityTitle') || 'Espace Fondateur'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {t('dashboard.welcome') || 'Bonjour'}, {currentProfile.display_name} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              {t('dashboard.welcomeSubtitle') || 'Voici votre vue d’ensemble : découvrez des profils complémentaires, suivez vos demandes et collaborez sur des projets concrets.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/app/projects/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-xl shadow-lg shadow-cyan-500/20 border border-cyan-400/30 transition transform active:scale-95 hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              <span>{t('projects.createProject') || 'Créer un projet'}</span>
            </Link>
            <Link
              href="/app/discover"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/80 rounded-xl border border-slate-700/80 transition"
            >
              <Compass className="h-4 w-4 text-cyan-400" />
              <span>{t('navigation.discover') || 'Découvrir'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#0c1322]/80 border border-slate-800/80 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t('connections.activeConnections') || 'Connexions'}
            </span>
            <div className="p-2 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-extrabold text-white">
            {activeConnectionsCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {t('connections.partnersInNetwork') || 'Membres dans votre réseau'}
          </p>
        </div>

        <div className="rounded-2xl bg-[#0c1322]/80 border border-slate-800/80 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t('connections.pendingRequests') || 'Demandes'}
            </span>
            <div className="p-2 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-500/30">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-extrabold text-white">
            {pendingRequests.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {t('connections.incomingPending') || 'En attente de réponse'}
          </p>
        </div>

        <div className="rounded-2xl bg-[#0c1322]/80 border border-slate-800/80 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t('dashboard.myProjects') || 'Mes projets'}
            </span>
            <div className="p-2 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-500/30">
              <FolderGit2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-extrabold text-white">
            {myProjects.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {t('dashboard.createdProjectsCount') || 'Initiatives créées par vous'}
          </p>
        </div>

        <div className="rounded-2xl bg-[#0c1322]/80 border border-slate-800/80 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t('dashboard.networkProjects') || 'Écosystème'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-extrabold text-white">
            {publicProjects.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {t('dashboard.projectsSeekingPartners') || 'Projets cherchant des membres'}
          </p>
        </div>
      </div>

      {/* SECTION: PENDING CONNECTION REQUESTS (IF ANY) */}
      {pendingRequests.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-400 animate-ping" />
              <h2 className="text-lg font-bold text-white">
                {t('connections.receivedRequests') || 'Demandes de connexion en attente'} ({pendingRequests.length})
              </h2>
            </div>
            <Link
              href="/app/connections"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              {t('common.viewAll') || 'Gérer'}
              <ArrowRight className="h-3.5 w-3.5 rtl-flip" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl border border-slate-800/90 bg-[#0d1527]/90 p-5 shadow-xl flex flex-col justify-between gap-4 backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {req.sender?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={req.sender.avatar_url}
                        alt={req.sender.display_name}
                        className="h-12 w-12 rounded-2xl object-cover border border-cyan-500/30"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold">
                        {req.sender?.display_name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <Link
                        href={`/app/profile/${req.sender_id}`}
                        className="text-sm font-bold text-white hover:text-cyan-300 transition"
                      >
                        {req.sender?.display_name}
                      </Link>
                      <p className="text-xs text-slate-400">
                        {req.sender?.city} • {req.sender?.university || 'Étudiant / Entrepreneur'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleRejectRequest(req.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                      title={t('connections.reject') || 'Refuser'}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        handleAcceptRequest(req.id, req.sender_id, req.sender?.display_name || '')
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white text-xs font-semibold shadow-md shadow-cyan-500/20"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{t('connections.accept') || 'Accepter'}</span>
                    </button>
                  </div>
                </div>

                {req.message && (
                  <div className="rounded-xl bg-[#080e1e] p-3 text-xs text-slate-300 border border-slate-800 italic">
                    &ldquo;{req.message}&rdquo;
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION: RECOMMENDED PEOPLE TO MEET */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <span>{t('dashboard.peopleToMeet') || 'Personnes que vous pourriez souhaiter rencontrer'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('dashboard.peopleToMeetSub') || 'Calculé par complémentarité de compétences, intérêts communs et proximité'}
            </p>
          </div>
          <Link
            href="/app/discover"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            {t('common.viewAll') || 'Explorer'}
            <ArrowRight className="h-3.5 w-3.5 rtl-flip" />
          </Link>
        </div>

        {recommendedPeople.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedPeople.map(({ profile, breakdown }) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                matchBreakdown={breakdown}
                onConnect={handleConnectProfile}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title={t('dashboard.noProfilesFound') || 'Aucun autre profil disponible pour le moment'}
            description={t('dashboard.noProfilesFoundDesc') || 'Invitez vos camarades d’université à créer leur profil pour débuter le matching.'}
            actionText={t('navigation.discover') || 'Explorer le réseau'}
            actionHref="/app/discover"
          />
        )}
      </section>

      {/* SECTION: PROJECTS MATCHING YOUR INTERESTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-400" />
              <span>{t('dashboard.matchingProjects') || 'Projets correspondant à vos compétences'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('dashboard.matchingProjectsSub') || 'Des fondateurs recherchent des profils comme le vôtre'}
            </p>
          </div>
          <Link
            href="/explore"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            {t('common.viewAll') || 'Tous les projets'}
            <ArrowRight className="h-3.5 w-3.5 rtl-flip" />
          </Link>
        </div>

        {publicProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {publicProjects.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderGit2}
            title={t('dashboard.noProjectsYet') || 'Aucun projet ouvert pour le moment'}
            description={t('dashboard.noProjectsYetDesc') || 'Publiez votre première idée pour trouver des cofondateurs motivés.'}
            actionText={t('projects.createProject') || 'Créer un projet'}
            actionHref="/app/projects/new"
          />
        )}
      </section>

      {/* SECTION: YOUR PROJECTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-teal-400" />
              <span>{t('dashboard.myProjects') || 'Vos projets'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('dashboard.myProjectsSub') || 'Gérez vos idées et les candidatures reçues'}
            </p>
          </div>
          <Link
            href="/app/projects/new"
            className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t('projects.createProject') || 'Nouveau projet'}</span>
          </Link>
        </div>

        {myProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {myProjects.map((project) => (
              <ProjectCard key={project.id} project={project} isOwner={true} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderGit2}
            title={t('dashboard.noPersonalProjects') || 'Vous n’avez pas encore créé de projet'}
            description={t('dashboard.noPersonalProjectsDesc') || 'Avez-vous une idée d’application, d’e-commerce ou d’agritech ? Partagez-la pour former une équipe.'}
            actionText={t('projects.createProject') || 'Publier ma première idée'}
            actionHref="/app/projects/new"
          />
        )}
      </section>
    </div>
  );
}
