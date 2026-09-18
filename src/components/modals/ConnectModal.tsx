'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Send, Loader2 } from 'lucide-react';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  onSubmit: (message: string) => Promise<void>;
}

export function ConnectModal({
  isOpen,
  onClose,
  targetName,
  onSubmit,
}: ConnectModalProps) {
  const [message, setMessage] = useState(
    `Bonjour ${targetName}, j’aimerais qu’on échange à propos de nos compétences et de nos projets !`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5) {
      setError('Veuillez écrire au moins quelques mots pour vous présenter.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit(message.trim());
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
      title={`Se connecter avec ${targetName}`}
      description="Présentez-vous brièvement et partagez ce qui a attiré votre attention sur ce profil."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Votre message d’introduction
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="Ex: Bonjour, j'ai vu votre expérience en tech et je cherche un associé pour une idée e-commerce..."
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
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Envoyer la demande
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
