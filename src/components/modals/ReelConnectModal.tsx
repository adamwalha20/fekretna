'use client';

import React, { useState } from 'react';
import { UserPlus, Send, Loader2, CheckCircle2, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

interface ReelConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetOwnerId: string;
  targetOwnerName: string;
  projectTitle: string;
  projectId: string;
  onSubmit: (reason: string, optionalMessage: string) => Promise<void>;
}

export function ReelConnectModal({
  isOpen,
  onClose,
  targetOwnerName,
  projectTitle,
  onSubmit,
}: ReelConnectModalProps) {
  const { t } = useI18n();

  const reasons = [
    { id: 'learn', label: t('reels.reasonLearn') || 'Je souhaite en savoir plus sur le projet' },
    { id: 'advice', label: t('reels.reasonAdvice') || 'J’ai un conseil ou une idée à partager' },
    { id: 'collaborate', label: t('reels.reasonCollaborate') || 'Je souhaite collaborer ou rejoindre l’équipe' },
    { id: 'skills', label: t('reels.reasonSkills') || 'J’ai des compétences pertinentes à apporter' },
    { id: 'other', label: t('reels.reasonOther') || 'Autre raison' },
  ];

  const [selectedReason, setSelectedReason] = useState('learn');
  const [optionalMessage, setOptionalMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const chosenReasonLabel = reasons.find((r) => r.id === selectedReason)?.label || selectedReason;

    try {
      await onSubmit(chosenReasonLabel, optionalMessage.trim());
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        setOptionalMessage('');
        onClose();
      }, 1400);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-cyan-500/30 bg-[#0c1222] p-6 sm:p-7 shadow-2xl shadow-cyan-500/10 text-white space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/30">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {t('reels.connectTitle') || 'Se connecter avec'} {targetOwnerName}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Projet : <span className="text-cyan-300 font-semibold">{projectTitle}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h4 className="text-base font-bold text-white">
              {t('reels.requestSent') || 'Demande envoyée avec succès !'}
            </h4>
            <p className="text-xs text-slate-400 max-w-xs">
              {targetOwnerName} recevra une notification avec vos coordonnées et votre message.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-rose-950/60 p-3 text-xs text-rose-300 border border-rose-500/30">
                {error}
              </div>
            )}

            {/* Why do you want to connect? */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                {t('reels.connectReasonPrompt') || 'Pourquoi souhaitez-vous vous connecter ?'}
              </label>
              <div className="space-y-2">
                {reasons.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition ${
                      selectedReason === r.id
                        ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200 shadow-md shadow-cyan-500/10'
                        : 'bg-[#070b16] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="connectReason"
                      value={r.id}
                      checked={selectedReason === r.id}
                      onChange={() => setSelectedReason(r.id)}
                      className="text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-slate-700 h-4 w-4"
                    />
                    <span className="font-medium">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Optional message */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('reels.optionalMessage') || 'Message d’introduction (optionnel)'}
              </label>
              <textarea
                rows={3}
                value={optionalMessage}
                onChange={(e) => setOptionalMessage(e.target.value)}
                placeholder="Ex: Bonjour, j'ai vu votre projet sur Fekretna et j'aimerais qu'on échange..."
                className="w-full rounded-2xl border border-slate-800 bg-[#070b16] p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-xl shadow-md shadow-cyan-500/20 transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>{t('reels.sendRequest') || 'Envoyer la demande'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
