'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Send,
  CheckCircle2,
  XCircle,
  Archive,
  ArrowLeft,
  Users,
  ShieldAlert,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ApplyModal } from '@/components/modals/ApplyModal';
import { ReportModal } from '@/components/modals/ReportModal';
import { createClient } from '@/lib/supabase/client';
import {
  Project,
  ProjectRole,
  Skill,
  ProjectApplication,
  Profile,
  ReportReason,
} from '@/types/database';
import { formatDate } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const { t, isRtl } = useI18n();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<
    | (Project & {
        roles?: ProjectRole[];
        skills?: Skill[];
        owner?: Profile;
      })
    | null
  >(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [applications, setApplications] = useState<
    (ProjectApplication & { applicant?: Profile })[]
  >([]);

  const [hasApplied, setHasApplied] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const isOwner = currentUserId === project?.owner_id;

  const loadProject = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      // Fetch Project
      const { data: projData, error: projError } = await supabase
        .from('projects')
        .select(
          '*, project_roles(*), project_skills(skills(*)), owner:profiles!projects_owner_id_fkey(*)'
        )
        .eq('id', id)
        .maybeSingle();

      if (projError || !projData) {
        setProject(null);
        return;
      }

      const formattedProject = {
        ...projData,
        roles: projData.project_roles || [],
        skills: projData.project_skills?.map((ps: { skills: Skill }) => ps.skills).filter(Boolean) || [],
        owner: projData.owner,
      };
      setProject(formattedProject as unknown as typeof project);

      if (user) {
        const { data: myApp } = await supabase
          .from('project_applications')
          .select('id')
          .eq('project_id', id)
          .eq('applicant_id', user.id)
          .maybeSingle();

        if (myApp) setHasApplied(true);

        // If owner, fetch applications
        if (projData.owner_id === user.id) {
          const { data: apps } = await supabase
            .from('project_applications')
            .select('*, applicant:profiles!project_applications_applicant_id_fkey(*)')
            .eq('project_id', id)
            .order('created_at', { ascending: false });

          if (apps) {
            setApplications(apps as unknown as typeof applications);
          }
        }
      }
    } catch (err) {
      console.error('Error loading project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleApply = async (data: { message: string; availabilityNote: string }) => {
    if (!project || !currentUserId) return;
    const supabase = createClient();

    const { error } = await supabase.from('project_applications').insert({
      project_id: project.id,
      applicant_id: currentUserId,
      message: data.message,
      availability_note: data.availabilityNote,
      status: 'pending',
    });

    if (error) throw error;

    await supabase.from('notifications').insert({
      user_id: project.owner_id,
      type: 'project_application',
      title: 'Nouvelle candidature à votre projet',
      body: `Un membre a postulé à votre projet "${project.title}".`,
      related_entity_id: project.id,
    });

    setHasApplied(true);
    showToast('Candidature envoyée avec succès !');
  };

  const handleAcceptApplicant = async (appId: string, applicantId: string) => {
    const supabase = createClient();
    try {
      const { error: appErr } = await supabase
        .from('project_applications')
        .update({ status: 'accepted' })
        .eq('id', appId);

      if (appErr) throw appErr;

      await supabase.from('project_members').upsert({
        project_id: id,
        user_id: applicantId,
        role: 'Membre',
        status: 'active',
      });

      await supabase.from('notifications').insert({
        user_id: applicantId,
        type: 'application_accepted',
        title: 'Candidature acceptée ! 🎉',
        body: `Félicitations, votre candidature pour le projet "${project?.title}" a été acceptée par son créateur.`,
        related_entity_id: id,
      });

      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: 'accepted' } : a))
      );
      showToast('Candidature acceptée ! Membre ajouté au projet.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleRejectApplicant = async (appId: string, applicantId: string) => {
    const supabase = createClient();
    try {
      const { error: appErr } = await supabase
        .from('project_applications')
        .update({ status: 'rejected' })
        .eq('id', appId);

      if (appErr) throw appErr;

      await supabase.from('notifications').insert({
        user_id: applicantId,
        type: 'application_rejected',
        title: 'Mise à jour concernant votre candidature',
        body: `Votre candidature pour le projet "${project?.title}" n’a pas été retenue. Nous vous encourageons à explorer d’autres projets sur Fekretna.`,
        related_entity_id: id,
      });

      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: 'rejected' } : a))
      );
      showToast('Candidature marquée comme refusée.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'closed' | 'archived') => {
    if (!confirm(`Confirmez-vous le passage du projet au statut "${newStatus}" ?`)) return;
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      if (project) setProject({ ...project, status: newStatus });
      showToast(`Statut du projet mis à jour : ${newStatus}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleReport = async (reason: ReportReason, description: string) => {
    if (!currentUserId || !project) return;
    const supabase = createClient();
    const { error } = await supabase.from('reports').insert({
      reporter_id: currentUserId,
      reported_project_id: project.id,
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
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-white">Projet introuvable</h2>
        <Link
          href="/app/projects"
          className="inline-flex items-center gap-1 text-sm text-cyan-400 font-semibold mt-4"
        >
          <ArrowLeft className="h-4 w-4 rtl-flip" />
          Retour aux projets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white px-5 py-3 shadow-2xl flex items-center gap-2 text-sm font-semibold border border-cyan-400/40 animate-bounce">
          <Sparkles className="h-4 w-4 text-cyan-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      <Link
        href="/app/projects"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition"
      >
        <ArrowLeft className="h-3.5 w-3.5 rtl-flip" />
        <span>{t('projects.backToProjects') || 'Retour aux projets'}</span>
      </Link>

      {/* Main Project Card */}
      <div className="rounded-3xl border border-slate-800/90 bg-[#0c1322]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Header Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
                {project.category}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300">
                {project.stage}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  project.status === 'active'
                    ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-950/60 border-amber-500/30 text-amber-300'
                }`}
              >
                {project.status === 'active'
                  ? 'Actif'
                  : project.status === 'closed'
                  ? 'Recrutement clos'
                  : 'Archivé'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {project.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-cyan-400">
                <MapPin className="h-3.5 w-3.5" />
                {project.city}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">{project.collaboration_format}</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                {formatDate(project.created_at)}
              </span>
            </div>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-2">
            {!isOwner && (
              <>
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-950/40 transition"
                  title="Signaler le projet"
                >
                  <ShieldAlert className="h-5 w-5" />
                </button>

                <button
                  onClick={() => setApplyModalOpen(true)}
                  disabled={hasApplied || project.status !== 'active'}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow-md ${
                    hasApplied
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-default'
                      : project.status !== 'active'
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/20 border border-cyan-400/30'
                  }`}
                >
                  <Send className="h-3.5 w-3.5 rtl-flip" />
                  <span>{hasApplied ? t('projects.applied') || 'Candidature envoyée' : t('discovery.apply') || 'Postuler à ce projet'}</span>
                </button>
              </>
            )}

            {isOwner && (
              <div className="flex items-center gap-2">
                {project.status === 'active' ? (
                  <button
                    onClick={() => handleStatusChange('closed')}
                    className="px-3.5 py-2 text-xs font-semibold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/30 rounded-xl transition"
                  >
                    Clore les candidatures
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange('active')}
                    className="px-3.5 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 rounded-xl transition"
                  >
                    Réactiver
                  </button>
                )}

                <button
                  onClick={() => handleStatusChange('archived')}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-950/40 transition border border-slate-800"
                  title="Archiver le projet"
                >
                  <Archive className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="py-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t('projects.descLabel') || 'Description du projet'}
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t('projects.targetProblem') || 'Problème ciblé'}
            </h3>
            <div className="rounded-2xl bg-[#080e1e] p-4 border border-slate-800 text-sm text-slate-300 leading-relaxed">
              {project.problem_description}
            </div>
          </div>

          {project.solution_description && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {t('projects.proposedSolution') || 'Solution proposée'}
              </h3>
              <div className="rounded-2xl bg-cyan-950/30 p-4 border border-cyan-500/20 text-sm text-cyan-200 leading-relaxed">
                {project.solution_description}
              </div>
            </div>
          )}

          {/* Roles Sought */}
          {project.roles && project.roles.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {t('projects.requiredRoles') || 'Rôles recherchés'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.roles.map((r) => (
                  <div
                    key={r.id}
                    className={`rounded-2xl border p-4 transition ${
                      r.filled
                        ? 'border-slate-800 bg-[#080e1e] text-slate-500'
                        : 'border-cyan-500/30 bg-[#0a1120] shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">
                        {r.role_name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                          r.filled
                            ? 'bg-slate-900 border-slate-800 text-slate-600'
                            : 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        {r.filled ? 'Pourvu' : 'Recherché'}
                      </span>
                    </div>
                    {r.description && (
                      <p className="text-xs text-slate-400 mt-1">{r.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Required */}
          {project.skills && project.skills.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {t('projects.skillsLabel') || 'Compétences souhaitées'}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.skills.map((s) => (
                  <span
                    key={s.id || s.name}
                    className="text-xs px-2.5 py-1 rounded-xl bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-medium"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Project Owner Section */}
        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {project.owner?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.owner.avatar_url}
                alt={project.owner.display_name}
                className="h-11 w-11 rounded-full object-cover border border-cyan-500/40"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold">
                {project.owner?.display_name?.charAt(0) || 'P'}
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-slate-400">{t('projects.founder') || 'Porteur du projet'}</p>
              <Link
                href={`/app/profile/${project.owner_id}`}
                className="text-sm font-bold text-white hover:text-cyan-300 transition"
              >
                {project.owner?.display_name || 'Fondateur Fekretna'}
              </Link>
              <p className="text-[11px] text-slate-400">{project.owner?.city || 'Tunisie'}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">{t('projects.commitment') || 'Engagement'}</span>
            <span className="text-xs font-semibold text-slate-200">
              {project.commitment_expectation}
            </span>
          </div>
        </div>
      </div>

      {/* OWNER DASHBOARD: Manage Project Applications */}
      {isOwner && (
        <div className="rounded-3xl border border-slate-800/90 bg-[#0c1322]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-400" />
                <span>{t('projects.applicationsReceived') || 'Candidatures reçues'} ({applications.length})</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Examinez les candidatures et décidez qui intégrer à votre équipe
              </p>
            </div>
          </div>

          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-2xl border border-slate-800 p-5 space-y-3 bg-[#080e1e]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold text-sm">
                        {app.applicant?.display_name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <Link
                          href={`/app/profile/${app.applicant_id}`}
                          className="text-sm font-bold text-white hover:text-cyan-300 transition"
                        >
                          {app.applicant?.display_name || 'Candidat'}
                        </Link>
                        <p className="text-xs text-slate-400">
                          {app.applicant?.city} • {app.applicant?.experience_level || 'Niveau non précisé'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                          app.status === 'accepted'
                            ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                            : app.status === 'rejected'
                            ? 'bg-slate-900 border-slate-800 text-slate-500'
                            : 'bg-amber-950/60 border-amber-500/30 text-amber-300'
                        }`}
                      >
                        {app.status === 'accepted'
                          ? 'Acceptée'
                          : app.status === 'rejected'
                          ? 'Refusée'
                          : 'En attente'}
                      </span>
                    </div>
                  </div>

                  {/* Applicant Motivation */}
                  <div className="rounded-xl bg-[#0c1322] p-3.5 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                    <span className="font-semibold text-slate-300 block mb-1">
                      Motivation du candidat :
                    </span>
                    <p className="whitespace-pre-line text-slate-300">{app.message}</p>
                    {app.availability_note && (
                      <p className="mt-2 text-slate-400 text-[11px]">
                        <strong>Disponibilité :</strong> {app.availability_note}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons for Pending */}
                  {app.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleRejectApplicant(app.id, app.applicant_id)}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>{t('projects.reject') || 'Refuser'}</span>
                      </button>

                      <button
                        onClick={() => handleAcceptApplicant(app.id, app.applicant_id)}
                        className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-xl shadow-md transition"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{t('projects.accept') || 'Accepter'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">
              Aucune candidature reçue pour l’instant. Votre projet est visible sur la page Découvrir.
            </p>
          )}
        </div>
      )}

      {/* Modals */}
      <ApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        projectTitle={project.title}
        onSubmit={handleApply}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="projet"
        targetId={project.id}
        onSubmit={handleReport}
      />
    </div>
  );
}
