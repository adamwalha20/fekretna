import React from 'react';
import Link from 'next/link';
import { Shield, AlertTriangle, Users, FolderGit2, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let usersCount = 0;
  let projectsCount = 0;
  let reportsCount = 0;
  let pendingReportsCount = 0;

  try {
    const supabase = await createClient();

    const { count: uCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    usersCount = uCount || 0;

    const { count: pCount } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true });
    projectsCount = pCount || 0;

    const { count: rCount } = await supabase
      .from('reports')
      .select('id', { count: 'exact', head: true });
    reportsCount = rCount || 0;

    const { count: prCount } = await supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');
    pendingReportsCount = prCount || 0;
  } catch {
    // Graceful fallback
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Tableau de bord administrateur
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Surveillez l’activité, modérez les contenus signalés et veillez au respect de la charte
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-5 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Membres inscrits</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">{usersCount}</p>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 mt-2"
          >
            Voir les utilisateurs
            <ArrowRight className="h-3 w-3 rtl-flip" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-5 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Projets publiés</span>
            <FolderGit2 className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{projectsCount}</p>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 mt-2"
          >
            Gérer les projets
            <ArrowRight className="h-3 w-3 rtl-flip" />
          </Link>
        </div>

        <div className="rounded-2xl border border-rose-800/50 bg-rose-950/20 backdrop-blur-md p-5 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-300">Signalements en attente</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-200">{pendingReportsCount}</p>
          <Link
            href="/admin/reports"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 mt-2"
          >
            Examiner les alertes
            <ArrowRight className="h-3 w-3 rtl-flip" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-5 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total signalements</span>
            <Shield className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{reportsCount}</p>
          <span className="text-[11px] text-slate-500 mt-2 block">Historique complet</span>
        </div>
      </div>

      {/* Guidelines & Safety Checklist */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-6 shadow-lg shadow-black/30 space-y-3">
        <h3 className="text-sm font-bold text-white">
          Consignes de modération Fekretna
        </h3>
        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
          <li>Traiter les signalements de harcèlement et d’usurpation d’identité en priorité.</li>
          <li>Désactiver les projets qui s’apparentent à des schémas pyramidaux ou du spam pur.</li>
          <li>Ne jamais divulguer l’identité du déclarant à l’utilisateur signalé.</li>
        </ul>
      </div>
    </div>
  );
}
