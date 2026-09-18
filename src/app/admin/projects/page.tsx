'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Archive, CheckCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';
import { Project } from '@/types/database';
import { formatDate } from '@/lib/utils';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadProjects = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setProjects(data as Project[]);
    } catch (err) {
      console.error('Error loading admin projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleToggleStatus = async (projectId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active';
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) throw error;
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: newStatus as Project['status'] } : p))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Gestion des projets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Surveillez les projets publiés et gérez leur statut de visibilité
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un projet..."
            className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Titre</th>
                  <th className="px-5 py-3">Catégorie</th>
                  <th className="px-5 py-3">Stade</th>
                  <th className="px-5 py-3">Ville</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <Link
                        href={`/app/projects/${proj.id}`}
                        className="hover:text-teal-600 transition"
                      >
                        {proj.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">{proj.category}</td>
                    <td className="px-5 py-3.5">{proj.stage}</td>
                    <td className="px-5 py-3.5">{proj.city}</td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={proj.status === 'active' ? 'success' : 'secondary'}
                        size="sm"
                      >
                        {proj.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {formatDate(proj.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleToggleStatus(proj.id, proj.status)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          proj.status === 'active'
                            ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {proj.status === 'active' ? (
                          <>
                            <Archive className="h-3 w-3" />
                            Désactiver
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Réactiver
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
