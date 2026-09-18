'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, FolderGit2, Send, ArrowRight, Sparkles, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';
import { Project, ProjectApplication } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';

export default function MyProjectsPage() {
  const { t, isRTL } = useI18n();
  const [activeTab, setActiveTab] = useState<'my_projects' | 'applications'>('my_projects');
  const [loading, setLoading] = useState(true);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [myApplications, setMyApplications] = useState<(ProjectApplication & { project: Project })[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // 1. Fetch user's own projects
          const { data: projs } = await supabase
            .from('projects')
            .select('*, project_roles(*), project_skills(skills(*))')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false });

          if (projs) setMyProjects(projs as unknown as Project[]);

          // 2. Fetch user's applications sent
          const { data: apps } = await supabase
            .from('project_applications')
            .select('*, project:projects(*)')
            .eq('applicant_id', user.id)
            .order('created_at', { ascending: false });

          if (apps) setMyApplications(apps as unknown as (ProjectApplication & { project: Project })[]);
        }
      } catch (err) {
        console.error('Error loading projects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleWithdrawApplication = async (applicationId: string) => {
    if (!confirm(t('projects.withdrawConfirm'))) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('project_applications')
        .update({ status: 'withdrawn' })
        .eq('id', applicationId);

      if (error) throw error;
      setMyApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: 'withdrawn' } : app))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : t('errors.generic'));
    }
  };

  const statusBadgeVariant = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'secondary',
    withdrawn: 'outline',
  } as const;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return t('projects.statusPending');
      case 'accepted':
        return t('projects.statusAccepted');
      case 'rejected':
        return t('projects.statusRejected');
      case 'withdrawn':
        return t('projects.statusWithdrawn');
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t('projects.myProjects')}
            </h1>
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('projects.projectsSub')}
          </p>
        </div>

        <Link
          href="/app/projects/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl shadow-lg shadow-cyan-500/20 transition-all self-start sm:self-auto group"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
          <span>{t('projects.createTitle')}</span>
        </Link>
      </div>

      {/* Futuristic Tabs */}
      <div className="flex border-b border-slate-800/80 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('my_projects')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'my_projects'
              ? 'border-cyan-400 text-cyan-300 font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderGit2 className="h-4 w-4" />
          <span>{t('projects.tabMyProjects')}</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {myProjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'applications'
              ? 'border-cyan-400 text-cyan-300 font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="h-4 w-4" />
          <span>{t('projects.tabApplications')}</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {myApplications.length}
          </span>
        </button>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* Tab 1: My Projects */}
      {!loading && activeTab === 'my_projects' && (
        <>
          {myProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProjects.map((proj) => (
                <ProjectCard key={proj.id} project={proj} isOwner={true} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FolderGit2}
              title={t('projects.emptyMyProjectsTitle')}
              description={t('projects.emptyMyProjectsSub')}
              actionText={t('projects.createTitle')}
              actionHref="/app/projects/new"
            />
          )}
        </>
      )}

      {/* Tab 2: My Applications */}
      {!loading && activeTab === 'applications' && (
        <div className="space-y-4">
          {myApplications.length > 0 ? (
            <div className="space-y-3">
              {myApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md hover:border-cyan-500/40 transition-all shadow-md shadow-black/30"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5">
                      <Link
                        href={`/app/projects/${app.project_id}`}
                        className="text-base font-bold text-white hover:text-cyan-400 transition"
                      >
                        {app.project?.title || 'Projet'}
                      </Link>
                      <Badge variant={statusBadgeVariant[app.status]} size="sm">
                        {getStatusLabel(app.status)}
                      </Badge>
                    </div>

                    {app.message && (
                      <p className="text-xs text-slate-300 line-clamp-2 italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
                        &ldquo;{app.message}&rdquo;
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span>{t('projects.appliedOn')} {formatDate(app.created_at)}</span>
                      {app.availability_note && (
                        <span>• {t('projects.availability')} : {app.availability_note}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      href={`/app/projects/${app.project_id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-cyan-300 hover:bg-cyan-950/40 border border-slate-700/60 hover:border-cyan-500/40 rounded-xl transition"
                    >
                      <span>{t('projects.viewProject')}</span>
                      <ArrowRight className="h-3 w-3 rtl-flip" />
                    </Link>

                    {app.status === 'pending' && (
                      <button
                        onClick={() => handleWithdrawApplication(app.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-800/40 rounded-xl transition"
                      >
                        {t('projects.withdraw')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Send}
              title={t('projects.emptyMyApplicationsTitle')}
              description={t('projects.emptyMyApplicationsSub')}
              actionText={t('discovery.title')}
              actionHref="/app/discover"
            />
          )}
        </div>
      )}
    </div>
  );
}
