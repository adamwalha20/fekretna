'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Send, Loader2 } from 'lucide-react';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  onSubmit: (data: { message: string; availabilityNote: string }) => Promise<void>;
}

export function ApplyModal({
  isOpen,
  onClose,
  projectTitle,
  onSubmit,
}: ApplyModalProps) {
  const [message, setMessage] = useState('');
  const [availabilityNote, setAvailabilityNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      setError('Veuillez préciser vos motivations en au moins 10 caractères.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        message: message.trim(),
        availabilityNote: availabilityNote.trim(),
      });
      onClose();
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
      title={`Rejoindre "${projectTitle}"`}
      description="Partagez avec le porteur du projet vos compétences, votre motivation et le rôle que vous aimeriez occuper."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Pourquoi voulez-vous rejoindre ce projet ? *
          </label>
          <textarea
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="Décrivez vos compétences, votre intérêt pour cette thématique et votre valeur ajoutée..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Votre disponibilité hebdomadaire
          </label>
          <input
            type="text"
            value={availabilityNote}
            onChange={(e) => setAvailabilityNote(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="Ex: 5 à 10h/semaine, soirs et weekends"
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
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Postuler
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
