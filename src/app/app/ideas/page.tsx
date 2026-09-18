'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Clock, 
  Filter, 
  Lightbulb, 
  Plus, 
  Users, 
  RefreshCw, 
  ChevronUp, 
  ChevronDown,
  Layers,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Project, Profile, Skill } from '@/types/database';
import { ProjectReelItem } from '@/components/reels/ProjectReelItem';
import { ProjectReelSkeleton } from '@/components/reels/ProjectReelSkeleton';
import { ReelsCommentsPanel } from '@/components/reels/ReelsCommentsPanel';
import { ReelAdviceModal } from '@/components/modals/ReelAdviceModal';
import { ReelConnectModal } from '@/components/modals/ReelConnectModal';
import { ApplyModal } from '@/components/modals/ApplyModal';
import { useI18n } from '@/lib/i18n/context';

export default function IdeasReelsPage() {
  const { t, isRtl } = useI18n();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  // Tabs & Filters
  const [feedTab, setFeedTab] = useState<'forYou' | 'newest'>('forYou');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  // Active modal states
  const [activeProjectForComments, setActiveProjectForComments] = useState<Project | null>(null);
  const [activeProjectForAdvice, setActiveProjectForAdvice] = useState<Project | null>(null);
  const [activeProjectForConnect, setActiveProjectForConnect] = useState<Project | null>(null);
  const [activeProjectForCollaborate, setActiveProjectForCollaborate] = useState<Project | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Scroll snap container ref & active index
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Load current user and projects data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      let userProf: Profile | null = null;
      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*, skills:profile_skills(skill:skills(*))')
          .eq('id', user.id)
          .maybeSingle();

        if (prof) {
          const formattedSkills = (prof.skills || [])
            .map((ps: { skill: Skill }) => ps.skill)
            .filter(Boolean);
          userProf = { ...prof, skills: formattedSkills };
          setCurrentUser(userProf);
        }
      }

      // Fetch active public projects
      const { data: projs, error: projsErr } = await supabase
        .from('projects')
        .select(`
          id,
          owner_id,
          title,
          description,
          problem_description,
          solution_description,
          category,
          stage,
          city,
          collaboration_format,
          commitment_expectation,
          visibility,
          status,
          created_at,
          updated_at,
          owner:profiles!projects_owner_id_fkey(
            id,
            display_name,
            username,
            avatar_url,
            city,
            university
          ),
          skills:project_skills(
            skill:skills(id, name, category)
          )
        `)
        .eq('visibility', 'public')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (projsErr) throw projsErr;

      // Fetch user's likes & like counts
      const projectIds = (projs || []).map((p) => p.id);

      let userLikesSet = new Set<string>();
      const likesCountMap: Record<string, number> = {};
      const commentsCountMap: Record<string, number> = {};

      if (projectIds.length > 0) {
        // Fetch all likes for these projects
        const { data: allLikes } = await supabase
          .from('project_likes')
          .select('project_id, user_id')
          .in('project_id', projectIds);

        if (allLikes) {
          allLikes.forEach((like: { project_id: string; user_id: string }) => {
            likesCountMap[like.project_id] = (likesCountMap[like.project_id] || 0) + 1;
            if (user && like.user_id === user.id) {
              userLikesSet.add(like.project_id);
            }
          });
        }

        // Fetch comments count for these projects
        const { data: allComments } = await supabase
          .from('project_comments')
          .select('project_id');

        if (allComments) {
          allComments.forEach((c: { project_id: string }) => {
            commentsCountMap[c.project_id] = (commentsCountMap[c.project_id] || 0) + 1;
          });
        }
      }

      const formattedProjects: Project[] = (projs || []).map((raw: any) => {
        const skills = (raw.skills || [])
          .map((ps: any) => (Array.isArray(ps.skill) ? ps.skill[0] : ps.skill))
          .filter(Boolean);

        const owner = Array.isArray(raw.owner) ? raw.owner[0] : raw.owner;

        return {
          ...raw,
          owner,
          skills,
          has_liked: userLikesSet.has(raw.id),
          likes_count: likesCountMap[raw.id] || 0,
          comments_count: commentsCountMap[raw.id] || 0,
        } as unknown as Project;
      });

      setProjects(formattedProjects);
    } catch (err: unknown) {
      console.error('Error loading reels projects:', err);
      setError(err instanceof Error ? err.message : 'Impossible de charger les idées');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 2. Feed algorithm & filtering
  const filteredAndRankedProjects = useMemo(() => {
    let result = [...projects];

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((p) => (p.category || '').toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by stage
    if (selectedStage !== 'all') {
      result = result.filter((p) => (p.stage || '').toLowerCase() === selectedStage.toLowerCase());
    }

    if (feedTab === 'newest') {
      return result.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    // "For You" deterministic scoring
    const userSkillNames = new Set((currentUser?.skills || []).map((s) => s.name.toLowerCase()));

    return result.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Skill overlap
      (a.skills || []).forEach((s) => {
        if (userSkillNames.has(s.name.toLowerCase())) scoreA += 3;
      });
      (b.skills || []).forEach((s) => {
        if (userSkillNames.has(s.name.toLowerCase())) scoreB += 3;
      });

      // City proximity
      if (currentUser?.city && a.city?.toLowerCase() === currentUser.city.toLowerCase()) scoreA += 2;
      if (currentUser?.city && b.city?.toLowerCase() === currentUser.city.toLowerCase()) scoreB += 2;

      // Engagement signals (likes & comments count)
      scoreA += (a.likes_count || 0) * 1.5 + (a.comments_count || 0) * 2;
      scoreB += (b.likes_count || 0) * 1.5 + (b.comments_count || 0) * 2;

      // Freshness bonus
      const ageHoursA = (Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60);
      const ageHoursB = (Date.now() - new Date(b.created_at).getTime()) / (1000 * 60 * 60);
      if (ageHoursA < 72) scoreA += 2;
      if (ageHoursB < 72) scoreB += 2;

      return scoreB - scoreA;
    });
  }, [projects, feedTab, selectedCategory, selectedStage, currentUser]);

  // 3. Scroll tracking & index calculation
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    if (clientHeight > 0) {
      const idx = Math.round(scrollTop / clientHeight);
      setActiveIndex(idx);
    }
  };

  const scrollToProject = (index: number) => {
    if (!containerRef.current) return;
    const clientHeight = containerRef.current.clientHeight;
    containerRef.current.scrollTo({
      top: index * clientHeight,
      behavior: 'smooth',
    });
  };

  // 4. Like / Unlike Action
  const handleToggleLike = async (projectId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      showToast(t('errors.unauthorized') || 'Veuillez vous connecter pour aimer un projet.');
      return;
    }

    const targetProject = projects.find((p) => p.id === projectId);
    if (!targetProject) return;

    const previouslyLiked = !!targetProject.has_liked;
    const newLikesCount = previouslyLiked
      ? Math.max(0, (targetProject.likes_count || 1) - 1)
      : (targetProject.likes_count || 0) + 1;

    // Optimistic state update
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, has_liked: !previouslyLiked, likes_count: newLikesCount }
          : p
      )
    );

    try {
      if (previouslyLiked) {
        await supabase
          .from('project_likes')
          .delete()
          .match({ project_id: projectId, user_id: user.id });
      } else {
        await supabase.from('project_likes').insert({
          project_id: projectId,
          user_id: user.id,
        });

        // Send notification to owner
        if (targetProject.owner_id && targetProject.owner_id !== user.id) {
          await supabase.from('notifications').insert({
            user_id: targetProject.owner_id,
            type: 'project_like',
            title: 'Nouveau coup de cœur sur votre projet',
            body: `${currentUser?.display_name || 'Un membre'} a aimé votre projet "${targetProject.title}".`,
            related_entity_id: projectId,
          });
        }
      }
    } catch (err) {
      console.error('Like toggle error:', err);
      // Rollback on error
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, has_liked: previouslyLiked, likes_count: targetProject.likes_count }
            : p
        )
      );
    }
  };

  // 5. Advice Submit Action
  const handleSubmitAdvice = async (adviceText: string) => {
    if (!activeProjectForAdvice) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error(t('errors.unauthorized') || 'Veuillez vous connecter.');

    const proj = activeProjectForAdvice;

    const { error: adviceErr } = await supabase.from('project_advice').insert({
      project_id: proj.id,
      author_id: user.id,
      content: adviceText,
    });

    if (adviceErr) throw adviceErr;

    // Send notification to owner
    if (proj.owner_id) {
      await supabase.from('notifications').insert({
        user_id: proj.owner_id,
        type: 'project_advice',
        title: 'Nouveau conseil bienveillant reçu',
        body: `${currentUser?.display_name || 'Un membre'} vous a envoyé une idée / conseil pour "${proj.title}": "${adviceText.slice(0, 100)}${adviceText.length > 100 ? '...' : ''}"`,
        related_entity_id: proj.id,
      });
    }

    showToast(t('reels.adviceSent') || 'Votre conseil a été transmis au fondateur !');
  };

  // 6. Connect Submit Action
  const handleSubmitConnect = async (reason: string, optionalMessage: string) => {
    if (!activeProjectForConnect) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error(t('errors.unauthorized') || 'Veuillez vous connecter.');

    const proj = activeProjectForConnect;
    const ownerId = proj.owner_id;

    if (ownerId === user.id) {
      throw new Error('Vous êtes déjà le créateur de ce projet.');
    }

    const fullMessage = `${reason}${optionalMessage ? `\n\n"${optionalMessage}"` : ''}`;

    const { error: connErr } = await supabase.from('connection_requests').insert({
      sender_id: user.id,
      receiver_id: ownerId,
      message: fullMessage,
      project_id: proj.id,
      status: 'pending',
    });

    if (connErr) throw connErr;

    await supabase.from('notifications').insert({
      user_id: ownerId,
      type: 'connection_request',
      title: 'Nouvelle demande de connexion',
      body: `${currentUser?.display_name || 'Un membre'} souhaite se connecter avec vous à propos de "${proj.title}".`,
      related_entity_id: user.id,
    });

    showToast(t('reels.requestSent') || 'Demande de connexion envoyée avec succès !');
  };

  // 7. Collaborate Submit Action
  const handleSubmitCollaborate = async (data: { message: string; availabilityNote: string }) => {
    if (!activeProjectForCollaborate) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error(t('errors.unauthorized') || 'Veuillez vous connecter.');

    const proj = activeProjectForCollaborate;

    const { error: appErr } = await supabase.from('project_applications').insert({
      project_id: proj.id,
      applicant_id: user.id,
      message: data.message,
      availability_note: data.availabilityNote,
      status: 'pending',
    });

    if (appErr) throw appErr;

    if (proj.owner_id) {
      await supabase.from('notifications').insert({
        user_id: proj.owner_id,
        type: 'project_application',
        title: 'Candidature reçue pour votre projet',
        body: `${currentUser?.display_name || 'Un membre'} souhaite collaborer sur "${proj.title}".`,
        related_entity_id: proj.id,
      });
    }

    showToast(t('reels.collaborateSuccess') || 'Votre candidature a été envoyée avec succès !');
  };

  // 8. Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeIndex < filteredAndRankedProjects.length - 1) {
          scrollToProject(activeIndex + 1);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeIndex > 0) {
          scrollToProject(activeIndex - 1);
        }
      } else if (e.key === 'l' || e.key === 'L') {
        const currentProject = filteredAndRankedProjects[activeIndex];
        if (currentProject) {
          handleToggleLike(currentProject.id);
        }
      } else if (e.key === 'c' || e.key === 'C') {
        const currentProject = filteredAndRankedProjects[activeIndex];
        if (currentProject) {
          setActiveProjectForComments((prev) => (prev ? null : currentProject));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, filteredAndRankedProjects]);

  return (
    <div className="relative flex flex-col h-[calc(100vh-4.5rem)] overflow-hidden">
      {/* Toast Alert notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-cyan-950/90 border border-cyan-500/40 text-cyan-200 text-xs font-semibold shadow-2xl shadow-cyan-950/50 backdrop-blur-md animate-slide-down">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Discovery Top Bar Controls */}
      <div className="flex-none flex items-center justify-between gap-3 px-3 sm:px-6 py-2 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#070b16]/70 backdrop-blur-md z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-300 text-xs font-bold hidden sm:flex">
            <Lightbulb className="h-3.5 w-3.5 text-orange-500 fill-orange-500/30" />
            <span>{t('navigation.ideas') || 'Idées'}</span>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setFeedTab('forYou')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition ${
                feedTab === 'forYou'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 dark:from-cyan-500 dark:to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t('reels.tabForYou') || 'Pour vous'}</span>
            </button>

            <button
              type="button"
              onClick={() => setFeedTab('newest')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition ${
                feedTab === 'newest'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 dark:from-cyan-500 dark:to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{t('reels.tabNewest') || 'Plus récents'}</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 hidden md:inline">
            {filteredAndRankedProjects.length} {t('navigation.projects') || 'projets'}
          </span>
        </div>

        {/* Compact Category & Stage Selectors */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-2.5 py-1 text-xs text-slate-800 dark:text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">Tous les domaines</option>
            <option value="Technology">Technologie / IA</option>
            <option value="Business">Business / FinTech</option>
            <option value="Design">Créatif / Média</option>
            <option value="Education">Éducation</option>
            <option value="Health">Santé / Écologie</option>
          </select>

          <Link
            href="/app/projects/new"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 transition"
          >
            <Plus className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{t('reels.createProject') || 'Créer'}</span>
          </Link>
        </div>
      </div>

      {/* Main Reels Vertical Snap Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <ProjectReelSkeleton />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {t('reels.errorTitle') || 'Impossible de charger les idées'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">{error}</p>
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{t('reels.retry') || 'Réessayer'}</span>
            </button>
          </div>
        ) : filteredAndRankedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center space-y-4">
            <div className="h-16 w-16 rounded-3xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-950/40">
              <Lightbulb className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-white">
              {t('reels.emptyTitle') || 'Aucune idée à découvrir pour le moment'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              {t('reels.emptyDesc') ||
                'Les nouveaux projets apparaîtront ici dès que les bâtisseurs commenceront à publier sur Fekretna.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/app/projects/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-cyan-500/20 transition"
              >
                <Plus className="h-4 w-4" />
                <span>{t('reels.createProject') || 'Créer un projet'}</span>
              </Link>
              <Link
                href="/app/discover"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 transition"
              >
                <Users className="h-4 w-4 text-cyan-400" />
                <span>{t('reels.exploreProfiles') || 'Découvrir des profils'}</span>
              </Link>
            </div>
          </div>
        ) : (
          filteredAndRankedProjects.map((project, idx) => (
            <ProjectReelItem
              key={project.id}
              project={project}
              currentUserId={currentUser?.id}
              onToggleLike={handleToggleLike}
              onOpenComments={(p) => setActiveProjectForComments(p)}
              onOpenConnect={(p) => setActiveProjectForConnect(p)}
              onOpenAdvice={(p) => setActiveProjectForAdvice(p)}
              onOpenCollaborate={(p) => setActiveProjectForCollaborate(p)}
            />
          ))
        )}
      </div>

      {/* Desktop Up/Down Navigation Floating Arrows */}
      {filteredAndRankedProjects.length > 1 && (
        <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 flex-col gap-2 z-30 pointer-events-auto">
          <button
            type="button"
            disabled={activeIndex === 0}
            onClick={() => scrollToProject(Math.max(0, activeIndex - 1))}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white shadow-lg backdrop-blur-md transition disabled:opacity-30 disabled:pointer-events-none"
            title="Projet précédent (Flèche haut)"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <div className="text-center text-[10px] font-bold text-slate-400 select-none">
            {activeIndex + 1}/{filteredAndRankedProjects.length}
          </div>
          <button
            type="button"
            disabled={activeIndex === filteredAndRankedProjects.length - 1}
            onClick={() => scrollToProject(Math.min(filteredAndRankedProjects.length - 1, activeIndex + 1))}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white shadow-lg backdrop-blur-md transition disabled:opacity-30 disabled:pointer-events-none"
            title="Projet suivant (Flèche bas)"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Comments Panel */}
      {activeProjectForComments && (
        <ReelsCommentsPanel
          isOpen={!!activeProjectForComments}
          onClose={() => setActiveProjectForComments(null)}
          projectId={activeProjectForComments.id}
          projectTitle={activeProjectForComments.title}
          ownerId={activeProjectForComments.owner_id}
          currentUserId={currentUser?.id}
          currentUserName={currentUser?.display_name}
          currentUserAvatar={currentUser?.avatar_url}
          onCommentAdded={(newCount) => {
            setProjects((prev) =>
              prev.map((p) =>
                p.id === activeProjectForComments.id
                  ? { ...p, comments_count: newCount }
                  : p
              )
            );
          }}
        />
      )}

      {/* Give Advice Modal */}
      {activeProjectForAdvice && (
        <ReelAdviceModal
          isOpen={!!activeProjectForAdvice}
          onClose={() => setActiveProjectForAdvice(null)}
          projectTitle={activeProjectForAdvice.title}
          ownerName={activeProjectForAdvice.owner?.display_name || 'Fondateur'}
          onSubmit={handleSubmitAdvice}
        />
      )}

      {/* Connect Modal */}
      {activeProjectForConnect && (
        <ReelConnectModal
          isOpen={!!activeProjectForConnect}
          onClose={() => setActiveProjectForConnect(null)}
          targetOwnerId={activeProjectForConnect.owner_id}
          targetOwnerName={activeProjectForConnect.owner?.display_name || 'Fondateur'}
          projectTitle={activeProjectForConnect.title}
          projectId={activeProjectForConnect.id}
          onSubmit={handleSubmitConnect}
        />
      )}

      {/* Collaborate Modal */}
      {activeProjectForCollaborate && (
        <ApplyModal
          isOpen={!!activeProjectForCollaborate}
          onClose={() => setActiveProjectForCollaborate(null)}
          projectTitle={activeProjectForCollaborate.title}
          onSubmit={handleSubmitCollaborate}
        />
      )}
    </div>
  );
}
