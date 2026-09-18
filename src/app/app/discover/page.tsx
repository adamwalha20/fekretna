'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Users, Layers, Flame, RotateCcw } from 'lucide-react';
import { ProfileCard } from '@/components/cards/ProfileCard';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { SwipeCard } from '@/components/cards/SwipeCard';
import { DiscoveryFilters, FilterState } from '@/components/discovery/DiscoveryFilters';
import { ConnectModal } from '@/components/modals/ConnectModal';
import { ApplyModal } from '@/components/modals/ApplyModal';
import { ReportModal } from '@/components/modals/ReportModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { createClient } from '@/lib/supabase/client';
import { Profile, Project, Skill, Interest, ReportReason } from '@/types/database';
import { rankCandidates, getMatchBreakdown, MatchBreakdown } from '@/lib/matching';
import { useI18n } from '@/lib/i18n/context';

type DiscoveryTab = 'people' | 'swipe' | 'projects';

export default function DiscoverPage() {
  const { t, isRtl } = useI18n();
  const [tab, setTab] = useState<DiscoveryTab>('people');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<(Profile & { skills?: Skill[]; interests?: Interest[] }) | null>(null);

  // Raw data from DB
  const [profiles, setProfiles] = useState<(Profile & { skills?: Skill[]; interests?: Interest[] })[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pendingConnectionIds, setPendingConnectionIds] = useState<string[]>([]);
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [appliedProjectIds, setAppliedProjectIds] = useState<string[]>([]);

  // Swipe Deck state
  const [swipeIndex, setSwipeIndex] = useState(0);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    city: '',
    format: '',
    stage: '',
    category: '',
    availability: '',
  });

  // Modal States
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [selectedTargetProfile, setSelectedTargetProfile] = useState<{ id: string; name: string } | null>(null);

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedTargetProject, setSelectedTargetProject] = useState<{ id: string; title: string } | null>(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'utilisateur' | 'projet' | 'message'; id: string } | null>(null);

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  // Load Data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        let myProfile: (Profile & { skills?: Skill[]; interests?: Interest[] }) | null = null;
        let blockedUserIds: string[] = [];

        if (user) {
          // Fetch current user profile
          const { data: myProf } = await supabase
            .from('profiles')
            .select('*, profile_skills(skills(*)), profile_interests(interests(*))')
            .eq('id', user.id)
            .maybeSingle();

          if (myProf) {
            myProfile = {
              ...myProf,
              skills: myProf.profile_skills?.map((ps: { skills: Skill }) => ps.skills).filter(Boolean) || [],
              interests: myProf.profile_interests?.map((pi: { interests: Interest }) => pi.interests).filter(Boolean) || [],
            };
            setCurrentUser(myProfile);
          }

          // Fetch blocked users
          const { data: blocks } = await supabase
            .from('blocks')
            .select('blocked_id')
            .eq('blocker_id', user.id);
          blockedUserIds = blocks?.map((b) => b.blocked_id) || [];

          // Fetch connection requests involving current user
          const { data: connRequests } = await supabase
            .from('connection_requests')
            .select('sender_id, receiver_id, status')
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

          if (connRequests) {
            const pendings: string[] = [];
            const accepteds: string[] = [];
            connRequests.forEach((req) => {
              const otherId = req.sender_id === user.id ? req.receiver_id : req.sender_id;
              if (req.status === 'pending') pendings.push(otherId);
              if (req.status === 'accepted') accepteds.push(otherId);
            });
            setPendingConnectionIds(pendings);
            setConnectedIds(accepteds);
          }

          // Fetch applied projects
          const { data: apps } = await supabase
            .from('project_applications')
            .select('project_id')
            .eq('applicant_id', user.id);
          if (apps) {
            setAppliedProjectIds(apps.map((a) => a.project_id));
          }
        }

        // Fetch candidate profiles (not current user, not blocked)
        let profilesQuery = supabase
          .from('profiles')
          .select('*, profile_skills(skills(*)), profile_interests(interests(*))')
          .eq('is_profile_visible', true);

        if (user) {
          profilesQuery = profilesQuery.neq('id', user.id);
        }

        const { data: rawProfiles } = await profilesQuery;

        if (rawProfiles) {
          const formattedProfiles = rawProfiles
            .filter((p) => !blockedUserIds.includes(p.id))
            .map((p) => ({
              ...p,
              skills: p.profile_skills?.map((ps: { skills: Skill }) => ps.skills).filter(Boolean) || [],
              interests: p.profile_interests?.map((pi: { interests: Interest }) => pi.interests).filter(Boolean) || [],
            }));

          // Rank using deterministic algorithm if current user profile exists
          if (myProfile) {
            setProfiles(rankCandidates(myProfile, formattedProfiles));
          } else {
            setProfiles(formattedProfiles);
          }
        }

        // Fetch projects
        const projectsQuery = supabase
          .from('projects')
          .select('*, project_roles(*), project_skills(skills(*))')
          .eq('visibility', 'public')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        const { data: rawProjects } = await projectsQuery;
        if (rawProjects) {
          setProjects(rawProjects as unknown as Project[]);
        }
      } catch (err) {
        console.error('Error fetching discovery data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filtered Profiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (filters.city && p.city.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }
      if (filters.format && p.collaboration_format !== filters.format) {
        return false;
      }
      if (filters.availability && p.availability !== filters.availability) {
        return false;
      }
      if (filters.category) {
        const hasSkillInCat = p.skills?.some((s) => s.category.toLowerCase() === filters.category.toLowerCase());
        const hasInterestInCat = p.interests?.some((i) => i.name.toLowerCase().includes(filters.category.toLowerCase()));
        if (!hasSkillInCat && !hasInterestInCat) return false;
      }
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const inName = p.display_name.toLowerCase().includes(term);
        const inBio = p.bio?.toLowerCase().includes(term);
        const inUniv = p.university?.toLowerCase().includes(term);
        const inSkills = p.skills?.some((s) => s.name.toLowerCase().includes(term));
        if (!inName && !inBio && !inUniv && !inSkills) return false;
      }
      return true;
    });
  }, [profiles, filters]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (filters.city && p.city.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }
      if (filters.format && p.collaboration_format !== filters.format) {
        return false;
      }
      if (filters.stage && p.stage !== filters.stage) {
        return false;
      }
      if (filters.category && p.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const inTitle = p.title.toLowerCase().includes(term);
        const inDesc = p.description.toLowerCase().includes(term);
        const inProblem = p.problem_description.toLowerCase().includes(term);
        if (!inTitle && !inDesc && !inProblem) return false;
      }
      return true;
    });
  }, [projects, filters]);

  // Connection Request Action
  const handleOpenConnect = (profileId: string) => {
    const target = profiles.find((p) => p.id === profileId);
    if (target) {
      setSelectedTargetProfile({ id: target.id, name: target.display_name });
      setConnectModalOpen(true);
    }
  };

  const handleSubmitConnection = async (message: string) => {
    if (!selectedTargetProfile) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error(t('errors.unauthorized') || 'Veuillez vous connecter.');

    const { error } = await supabase.from('connection_requests').insert({
      sender_id: user.id,
      receiver_id: selectedTargetProfile.id,
      message,
      status: 'pending',
    });

    if (error) throw error;

    await supabase.from('notifications').insert({
      user_id: selectedTargetProfile.id,
      type: 'connection_request',
      title: 'Nouvelle demande de connexion',
      body: `${currentUser?.display_name || 'Un membre'} souhaite se connecter avec vous sur Fekretna.`,
      related_entity_id: user.id,
    });

    setPendingConnectionIds((prev) => [...prev, selectedTargetProfile.id]);
    showToast(`Demande envoyée à ${selectedTargetProfile.name} !`);
  };

  // Swipe Action Handlers
  const handleSwipePass = () => {
    if (swipeIndex < filteredProfiles.length) {
      setSwipeIndex((prev) => prev + 1);
    }
  };

  const handleSwipeInterested = () => {
    const target = filteredProfiles[swipeIndex];
    if (target) {
      setSelectedTargetProfile({ id: target.id, name: target.display_name });
      setConnectModalOpen(true);
      setSwipeIndex((prev) => prev + 1);
    }
  };

  // Project Application Action
  const handleOpenApply = (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (target) {
      setSelectedTargetProject({ id: target.id, title: target.title });
      setApplyModalOpen(true);
    }
  };

  const handleSubmitApplication = async (data: { message: string; availabilityNote: string }) => {
    if (!selectedTargetProject) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error(t('errors.unauthorized') || 'Veuillez vous connecter.');

    const { error } = await supabase.from('project_applications').insert({
      project_id: selectedTargetProject.id,
      applicant_id: user.id,
      message: data.message,
      availability_note: data.availabilityNote,
      status: 'pending',
    });

    if (error) throw error;

    const proj = projects.find((p) => p.id === selectedTargetProject.id);
    if (proj?.owner_id) {
      await supabase.from('notifications').insert({
        user_id: proj.owner_id,
        type: 'project_application',
        title: 'Nouvelle candidature à votre projet',
        body: `${currentUser?.display_name || 'Un membre'} a postulé à votre projet "${proj.title}".`,
        related_entity_id: selectedTargetProject.id,
      });
    }

    setAppliedProjectIds((prev) => [...prev, selectedTargetProject.id]);
    showToast('Votre candidature a été envoyée au créateur du projet !');
  };

  // Report & Block
  const handleOpenReport = (type: 'utilisateur' | 'projet' | 'message', id: string) => {
    setReportTarget({ type, id });
    setReportModalOpen(true);
  };

  const handleSubmitReport = async (reason: ReportReason, description: string) => {
    if (!reportTarget) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error(t('errors.unauthorized') || 'Veuillez vous connecter.');

    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      reason,
      description,
      reported_user_id: reportTarget.type === 'utilisateur' ? reportTarget.id : null,
      reported_project_id: reportTarget.type === 'projet' ? reportTarget.id : null,
      reported_message_id: reportTarget.type === 'message' ? reportTarget.id : null,
      status: 'pending',
    });

    if (error) throw error;
    showToast('Signalement transmis à la modération.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification Banner */}
      {notificationMsg && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white px-5 py-3 shadow-2xl flex items-center gap-2 text-sm font-semibold border border-cyan-400/40 animate-bounce">
          <Sparkles className="h-4 w-4 text-cyan-300" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('discovery.title') || 'Découvrir le réseau'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('discovery.subtitle') || 'Découvrez des associés potentiels et des startups selon vos compétences complémentaires'}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="inline-flex rounded-2xl bg-[#090e1c] p-1.5 border border-slate-800/90 shadow-lg self-start sm:self-auto">
          <button
            onClick={() => setTab('people')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
              tab === 'people'
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/30 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Users className="h-4 w-4 text-cyan-400" />
            <span>{t('discovery.cofounders') || 'Cofondateurs'}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                tab === 'people'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {filteredProfiles.length}
            </span>
          </button>

          <button
            onClick={() => setTab('swipe')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
              tab === 'swipe'
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/30 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Flame className="h-4 w-4 text-amber-400" />
            <span>{t('discovery.interactiveMode') || 'Mode Interactif'}</span>
          </button>

          <button
            onClick={() => setTab('projects')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
              tab === 'projects'
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/30 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Layers className="h-4 w-4 text-cyan-400" />
            <span>{t('discovery.projectsTab') || 'Projets'}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                tab === 'projects'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {filteredProjects.length}
            </span>
          </button>
        </div>
      </div>

      {/* Discovery Filters Panel */}
      {tab !== 'swipe' && (
        <DiscoveryFilters
          filters={filters}
          onChange={setFilters}
          onReset={() =>
            setFilters({
              search: '',
              city: '',
              format: '',
              stage: '',
              category: '',
              availability: '',
            })
          }
          showProjectFilters={tab === 'projects'}
        />
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* TAB A: PEOPLE DISCOVERY */}
      {!loading && tab === 'people' && (
        <>
          {filteredProfiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((prof) => {
                const breakdown = currentUser ? getMatchBreakdown(currentUser, prof) : undefined;
                return (
                  <ProfileCard
                    key={prof.id}
                    profile={prof}
                    matchBreakdown={breakdown}
                    onConnect={handleOpenConnect}
                    onReport={(id) => handleOpenReport('utilisateur', id)}
                    isPending={pendingConnectionIds.includes(prof.id)}
                    isConnected={connectedIds.includes(prof.id)}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              title={t('discovery.noResults') || 'Aucun profil ne correspond à vos filtres'}
              description="Essayez de modifier vos filtres ou d’élargir la zone géographique."
              actionText={t('discovery.resetFilters') || 'Réinitialiser les filtres'}
              onActionClick={() =>
                setFilters({
                  search: '',
                  city: '',
                  format: '',
                  stage: '',
                  category: '',
                  availability: '',
                })
              }
            />
          )}
        </>
      )}

      {/* TAB B: SWIPE-STYLE DISCOVERY */}
      {!loading && tab === 'swipe' && (
        <div className="py-6">
          {swipeIndex < filteredProfiles.length ? (
            <div className="space-y-4">
              <div className="text-center text-xs text-slate-400">
                Profil {swipeIndex + 1} sur {filteredProfiles.length}
              </div>
              <SwipeCard
                profile={filteredProfiles[swipeIndex]}
                onPass={handleSwipePass}
                onInterested={handleSwipeInterested}
              />
              <p className="text-center text-[11px] text-slate-500 max-w-sm mx-auto">
                {t('discovery.swipeHint') || 'Cliquez sur la croix pour passer ou sur le cœur pour envoyer une invitation.'}
              </p>
            </div>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 mx-auto shadow-lg">
                <RotateCcw className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {t('discovery.endOfDeck') || 'Vous avez fait le tour des profils disponibles !'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Revenez plus tard pour découvrir de nouveaux inscrits de Sfax et de toute la Tunisie.
              </p>
              <button
                onClick={() => setSwipeIndex(0)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-xl shadow-md transition"
              >
                <RotateCcw className="h-4 w-4" />
                {t('discovery.restartDeck') || 'Recommencer le deck'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB C: PROJECT DISCOVERY */}
      {!loading && tab === 'projects' && (
        <>
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onApply={handleOpenApply}
                  onReport={(id) => handleOpenReport('projet', id)}
                  hasApplied={appliedProjectIds.includes(project.id)}
                  isOwner={project.owner_id === currentUser?.id}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={t('discovery.noProjectsFound') || 'Aucun projet ne correspond à vos filtres'}
              description="Ajustez vos filtres ou publiez votre propre projet pour démarrer une nouvelle initiative."
              actionText={t('projects.createProject') || 'Publier une idée'}
              actionHref="/app/projects/new"
            />
          )}
        </>
      )}

      {/* CONNECT MODAL */}
      {selectedTargetProfile && (
        <ConnectModal
          isOpen={connectModalOpen}
          onClose={() => {
            setConnectModalOpen(false);
            setSelectedTargetProfile(null);
          }}
          targetName={selectedTargetProfile.name}
          onSubmit={handleSubmitConnection}
        />
      )}

      {/* APPLY TO PROJECT MODAL */}
      {selectedTargetProject && (
        <ApplyModal
          isOpen={applyModalOpen}
          onClose={() => {
            setApplyModalOpen(false);
            setSelectedTargetProject(null);
          }}
          projectTitle={selectedTargetProject.title}
          onSubmit={handleSubmitApplication}
        />
      )}

      {/* REPORT MODAL */}
      {reportTarget && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setReportTarget(null);
          }}
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          onSubmit={handleSubmitReport}
        />
      )}
    </div>
  );
}
