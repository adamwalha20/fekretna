import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { createClient } from '@/lib/supabase/server';
import { Project } from '@/types/database';
import { Compass, Sparkles } from 'lucide-react';

interface ExploreProps {
  searchParams: Promise<{ category?: string; city?: string; search?: string }>;
}

export default async function ExplorePage({ searchParams }: ExploreProps) {
  const { category, city, search } = await searchParams;

  let projects: Project[] = [];

  try {
    const supabase = await createClient();
    let query = supabase
      .from('projects')
      .select('*, project_roles(*), project_skills(skills(*))')
      .eq('visibility', 'public')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }
    if (city) {
      query = query.eq('city', city);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data } = await query;
    if (data) {
      projects = data as unknown as Project[];
    }
  } catch {
    projects = [];
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#070a13] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16 relative overflow-hidden">
        {/* Cyber glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45rem] h-[25rem] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-3 py-1 rounded-full mb-2.5 shadow-sm">
                <Compass className="h-3.5 w-3.5 text-cyan-400" />
                <span>Exploration publique des initiatives</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Découvrez les projets & startups
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Parcourez les initiatives créées par des étudiants et jeunes entrepreneurs tunisiens.
              </p>
            </div>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-xl shadow-lg shadow-cyan-500/25 border border-cyan-400/30 transition transform hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" />
              Rejoindre pour postuler
            </Link>
          </div>

          {/* Project List */}
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aucun projet trouvé"
              description="Soyez le premier à publier votre projet ou affinez vos critères de recherche !"
              actionText="Créer un compte & publier"
              actionHref="/signup"
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
