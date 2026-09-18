'use client';

import React, { useState } from 'react';
import { Lightbulb, Send, Loader2, Sparkles, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

interface ReelAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  ownerName: string;
  onSubmit: (advice: string) => Promise<void>;
}

export function ReelAdviceModal({
  isOpen,
  onClose,
  projectTitle,
  ownerName,
  onSubmit,
}: ReelAdviceModalProps) {
  const { t } = useI18n();
  const [advice, setAdvice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    '💡 Idée de fonctionnalité :',
    '⚡ Suggestion technique :',
    '🚀 Stratégie de lancement :',
    '🎯 Conseil acquisition & marketing :',
  ];

  const handlePromptClick = (prompt: string) => {
    if (!advice.includes(prompt)) {
      setAdvice((prev) => (prev ? `${prev}\n\n${prompt} ` : `${prompt} `));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (advice.trim().length < 10) {
      setError('Veuillez écrire au moins une phrase constructive.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(advice.trim());
      setAdvice('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/30 bg-white dark:bg-[#0c1222] p-6 sm:p-7 shadow-2xl shadow-amber-500/10 text-slate-900 dark:text-white space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/30">
              <Lightbulb className="h-6 w-6 fill-slate-950 stroke-slate-950" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {t('reels.adviceTitle') || 'Donner un conseil à'} {ownerName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Projet : <span className="text-amber-700 dark:text-amber-300 font-semibold">{projectTitle}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info banner */}
        <p className="text-xs text-amber-900 dark:text-slate-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-3 leading-relaxed">
          {t('reels.adviceSubtitle') ||
            'Partagez une idée bienveillante, une recommandation technique ou un retour d’expérience pour aider le projet à progresser.'}
        </p>

        {/* Quick prompt suggestions */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            Suggestions rapides :
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePromptClick(qp)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500/40 hover:text-amber-700 dark:hover:text-amber-300 transition"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/60 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
              {error}
            </div>
          )}

          <div>
            <textarea
              rows={4}
              required
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              placeholder={t('reels.advicePlaceholder') || 'Écrivez votre idée ou conseil bienveillant...'}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070b16] p-3.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
              <span>Conseil visible par le créateur du projet</span>
              <span>{advice.length} caractères</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || advice.trim().length < 5}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 rounded-xl shadow-md shadow-amber-500/20 transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>{t('reels.sendAdvice') || 'Envoyer le conseil'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
