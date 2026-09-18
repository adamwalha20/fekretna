import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';
import { Project, ProjectRole, Skill } from '@/types/database';
import { MapPin, Calendar, LogIn, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface PublicProjectProps {
  params: Promise<{ id: string }>;
}

type PublicProject = Project & {
  roles?: ProjectRole[];
  skills?: Skill[];
  owner?: { display_name: string; city: string; avatar_url: string | null };
};

export default async function PublicProjectDetailPage({ params }: PublicProjectProps) {
  const { id } = await params;

  let project: PublicProject | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('projects')
      .select('*, project_roles(*), project_skills(skills(*)), owner:profiles!projects_owner_id_fkey(display_name, city, avatar_url)')
      .eq('id', id)
      .eq('visibility', 'public')
      .single();

    if (data) {
      project = data as unknown as PublicProject;
    }
  } catch {
    project = null;
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Projet introuvable</h2>
          <p className="text-sm text-slate-500 mb-6">
            Ce projet n&apos;existe pas ou a été rendu privé par son créateur.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;exploration
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-teal-600 mb-6 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour aux projets
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="primary">{project.category}</Badge>
                  <Badge variant="secondary">{project.stage}</Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {project.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-teal-600" />
                    {project.city}
                  </span>
                  <span>•</span>
                  <span>{project.collaboration_format}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(project.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:items-end">
                <span className="text-xs text-slate-400">Engagement</span>
                <span className="text-sm font-semibold text-slate-800">
                  {project.commitment_expectation}
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="py-6 space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Description du projet
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Problème résolu
                </h3>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-sm text-slate-700 leading-relaxed">
                  {project.problem_description}
                </div>
              </div>

              {project.solution_description && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Solution envisagée
                  </h3>
                  <div className="rounded-2xl bg-teal-50/60 p-4 border border-teal-100 text-sm text-teal-900 leading-relaxed">
                    {project.solution_description}
                  </div>
                </div>
              )}

              {/* Roles needed */}
              {project.roles && project.roles.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Rôles & Associés recherchés
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.roles.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-xl border border-slate-200 p-3 bg-white"
                      >
                        <p className="text-xs font-semibold text-slate-900">
                          {r.role_name}
                        </p>
                        {r.description && (
                          <p className="text-xs text-slate-500 mt-1">
                            {r.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTA to Apply */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 font-bold">
                  {project.owner?.display_name?.charAt(0) || 'P'}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Porteur du projet</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {project.owner?.display_name || 'Fondateur'}
                  </p>
                </div>
              </div>

              <Link
                href={`/login?redirect=/app/projects/${project.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition w-full sm:w-auto justify-center"
              >
                <LogIn className="h-4 w-4" />
                Se connecter pour postuler
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
