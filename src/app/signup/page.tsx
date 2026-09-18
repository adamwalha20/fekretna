'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n/context';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { FekretnaLogo } from '@/components/ui/FekretnaLogo';

export default function SignupPage() {
  const router = useRouter();
  const { t, isRtl } = useI18n();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (displayName.trim().length < 2) {
      setError(t('onboarding.nameRequired') || 'Veuillez renseigner votre nom complet.');
      return;
    }
    if (password.length < 6) {
      setError(t('auth.passwordLength') || 'Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        router.push('/app/onboarding');
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#070a13] text-slate-100 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Theme Toggle & Language Selector Top-Right */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSelector compact={true} />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3 group mb-4">
          <FekretnaLogo size={48} withGlow className="group-hover:scale-105 transition-transform duration-300" />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Fekretna
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-arabic">
                من فكرة لفريق
              </span>
            </div>
          </div>
        </Link>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          {t('auth.signupTitle') || 'Créer votre profil Fekretna'}
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          {t('auth.signupSubtitle') || 'من فكرة لفريق — Rejoignez la communauté d’entrepreneurs tunisiens'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#0c1322]/95 py-8 px-6 shadow-2xl rounded-3xl border border-slate-800/90 sm:px-10 backdrop-blur-xl">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-rose-950/40 p-3.5 text-xs text-rose-300 border border-rose-500/30 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('auth.fullName') || 'Nom complet'}
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ex: Mohamed Ben Salem"
                className="w-full rounded-2xl border border-slate-800 bg-[#080e1e] px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('auth.email') || 'Adresse email'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@domaine.tn"
                className="w-full rounded-2xl border border-slate-800 bg-[#080e1e] px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('auth.password') || 'Mot de passe'}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 6 caractères"
                className="w-full rounded-2xl border border-slate-800 bg-[#080e1e] px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              En créant un compte, vous acceptez nos{' '}
              <Link href="/terms" className="text-cyan-400 hover:underline">
                conditions d’utilisation
              </Link>{' '}
              et notre{' '}
              <Link href="/privacy" className="text-cyan-400 hover:underline">
                politique de confidentialité
              </Link>
              .
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/20 border border-cyan-400/30 transition disabled:opacity-50 mt-2 transform active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('auth.signingUp') || 'Création du compte...'}</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>{t('auth.signUpCta') || 'S’inscrire et continuer'}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              {t('auth.alreadyHaveAccount') || 'Déjà un compte ?'}{' '}
              <Link
                href="/login"
                className="font-semibold text-cyan-400 hover:text-cyan-300"
              >
                {t('auth.signIn') || 'Se connecter'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
