'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { ReportReason } from '@/types/database';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'utilisateur' | 'projet' | 'message';
  targetId: string;
  onSubmit: (reason: ReportReason, description: string) => Promise<void>;
}

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  onSubmit,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>('Spam');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasons: ReportReason[] = [
    'Spam',
    'Harassment',
    'Fake identity',
    'Inappropriate content',
    'Fraud or suspicious activity',
    'Other',
  ];

  const reasonLabels: Record<ReportReason, string> = {
    Spam: 'Spam ou publicité abusive',
    Harassment: 'Harcèlement ou comportement irrespectueux',
    'Fake identity': 'Faux profil / Usurpation d’identité',
    'Inappropriate content': 'Contenu inapproprié ou illégal',
    'Fraud or suspicious activity': 'Fraude ou tentative d’arnaque',
    Other: 'Autre raison',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 5) {
      setError('Veuillez préciser la raison de votre signalement.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(reason, description.trim());
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Signaler ce ${targetType}`}
      description="Aidez-nous à maintenir Fekretna comme un espace sain et respectueux. Votre signalement est strictement confidentiel."
    >
      {success ? (
        <div className="rounded-xl bg-emerald-50 p-4 text-center text-sm font-medium text-emerald-800 border border-emerald-200">
          Merci, votre signalement a bien été transmis à l’équipe de modération.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Motif principal
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {reasonLabels[r]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Détails du problème
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="Expliquez brièvement ce qui s'est passé..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Transmission...
                </>
              ) : (
                <>
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Envoyer le signalement
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
