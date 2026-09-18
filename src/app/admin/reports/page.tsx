'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';
import { Report, ReportStatus } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';

export default function AdminReportsPage() {
  const { t } = useI18n();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadReports = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('reports')
        .select('*, reporter:profiles!reports_reporter_id_fkey(*)')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data } = await query;
      if (data) setReports(data as unknown as Report[]);
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const handleUpdateStatus = async (reportId: string, newStatus: ReportStatus) => {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('reports')
        .update({
          status: newStatus,
          reviewed_by: user?.id || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const statusBadge = {
    pending: 'warning',
    in_review: 'info',
    resolved: 'success',
    dismissed: 'secondary',
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            Gestion des signalements
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Examinez et traitez les incidents signalés par les membres de la communauté
          </p>
        </div>

        {/* Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-700/80 px-3.5 py-2 text-xs text-slate-200 bg-slate-900/90 focus:outline-none focus:border-cyan-400 transition"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="in_review">En cours d&apos;examen</option>
          <option value="resolved">Résolus</option>
          <option value="dismissed">Classés sans suite</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
        </div>
      ) : reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-5 shadow-lg shadow-black/40 space-y-3.5 hover:border-slate-700/80 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="warning" size="sm">
                    {rep.reason}
                  </Badge>
                  <Badge variant={statusBadge[rep.status]} size="sm">
                    {rep.status}
                  </Badge>
                </div>

                <span className="text-[11px] text-slate-500">
                  Signalé le {formatDate(rep.created_at)}
                </span>
              </div>

              {/* Target description */}
              <div className="text-xs text-slate-300">
                <p className="font-semibold text-slate-200 mb-1.5">Motif / Détails :</p>
                <p className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/60 italic text-slate-300">
                  &ldquo;{rep.description || 'Aucun détail fourni'}&rdquo;
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                <span>
                  Signalé par : <strong className="text-slate-200">{rep.reporter?.display_name || 'Utilisateur anonyme'}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {rep.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(rep.id, 'resolved')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-sm"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Résoudre
                    </button>
                  )}

                  {rep.status !== 'dismissed' && (
                    <button
                      onClick={() => handleUpdateStatus(rep.id, 'dismissed')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Classer sans suite
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-800/80 bg-slate-900/30 p-12 text-center text-xs text-slate-400">
          <ShieldCheck className="h-8 w-8 mx-auto text-slate-600 mb-2" />
          Aucun incident ou signalement correspondant à ce filtre.
        </div>
      )}
    </div>
  );
}
