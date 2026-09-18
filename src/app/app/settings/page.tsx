'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Shield,
  Ban,
  LogOut,
  Save,
  Loader2,
  CheckCircle2,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { TUNISIAN_CITIES } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';
import { useTheme } from '@/lib/theme/context';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

interface BlockedUser {
  blocked_id: string;
  profile: Profile;
}

export default function SettingsPage() {
  const router = useRouter();
  const { t, locale, setLocale, isRtl } = useI18n();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Profile Edit fields
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('Sfax');
  const [university, setUniversity] = useState('');
  const [availability, setAvailability] = useState('Part-time');
  const [collaborationFormat, setCollaborationFormat] = useState('Hybrid');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');

  // Privacy fields
  const [discoverable, setDiscoverable] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'connections_only' | 'private'>('public');

  // Blocked users
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch Profile
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (prof) {
          setDisplayName(prof.display_name || '');
          setBio(prof.bio || '');
          setCity(prof.city || 'Sfax');
          setUniversity(prof.university || '');
          setAvailability(prof.availability || 'Part-time');
          setCollaborationFormat(prof.collaboration_format || 'Hybrid');
          setExperienceLevel(prof.experience_level || 'Intermediate');
          setDiscoverable(prof.is_profile_visible ?? true);
          setProfileVisibility(prof.profile_visibility || 'public');
        }

        // Fetch Blocked Users
        const { data: blocks } = await supabase
          .from('blocks')
          .select('blocked_id, profile:profiles!blocks_blocked_id_fkey(*)')
          .eq('blocker_id', user.id);

        if (blocks) {
          setBlockedUsers(blocks as unknown as BlockedUser[]);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t('errors.unauthorized') || 'Session expirée');

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          city,
          university: university.trim() || null,
          availability,
          collaboration_format: collaborationFormat,
          experience_level: experienceLevel,
          is_profile_visible: discoverable,
          profile_visibility: profileVisibility,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      setSuccessMsg(t('settings.saveSuccess') || 'Vos modifications ont été enregistrées avec succès.');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleUnblock = async (blockedId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('blocks')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', blockedId);

      if (error) throw error;
      setBlockedUsers((prev) => prev.filter((b) => b.blocked_id !== blockedId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t('settings.title') || 'Paramètres'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {t('settings.subtitle') || 'Gérez vos informations de compte, votre langue d’interface et votre confidentialité'}
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-cyan-950/70 p-4 text-xs font-semibold text-cyan-300 border border-cyan-500/40 shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SECTION 0: LANGUAGE & LOCALIZATION SELECTOR */}
      <div className="rounded-3xl border border-slate-800/90 bg-[#0c1322]/90 p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-4">
        <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-cyan-400" />
              <span>{t('settings.languageTitle') || 'Langue de l’application'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('settings.languageDesc') || 'Choisissez votre langue préférée. L’interface s’adapte immédiatement.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setLocale('fr')}
            className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold transition ${
              locale === 'fr'
                ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                : 'bg-[#080e1e] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-base">🇫🇷</span>
              <span>Français</span>
            </span>
            {locale === 'fr' && <span className="h-2 w-2 rounded-full bg-cyan-400" />}
          </button>

          <button
            type="button"
            onClick={() => setLocale('en')}
            className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold transition ${
              locale === 'en'
                ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                : 'bg-[#080e1e] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-base">🇬🇧</span>
              <span>English</span>
            </span>
            {locale === 'en' && <span className="h-2 w-2 rounded-full bg-cyan-400" />}
          </button>

          <button
            type="button"
            onClick={() => setLocale('ar')}
            className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold transition font-arabic ${
              locale === 'ar'
                ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                : 'bg-[#080e1e] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-base">🇹🇳</span>
              <span>العربية (تونس)</span>
            </span>
            {locale === 'ar' && <span className="h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
        </div>
      </div>

      {/* SECTION 0.5: APPEARANCE & THEME */}
      <div className="rounded-3xl border border-slate-800/90 bg-[#0c1322]/90 p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-4">
        <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-400" />
              <span>{t('settings.themeTitle') || 'Apparence & Thème'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('settings.themeDesc') || 'Choisissez entre le mode Nuit (sombre) et le mode Jour (clair).'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold transition ${
              theme === 'dark'
                ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                : 'bg-[#080e1e] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Moon className="h-4 w-4 text-cyan-400" />
              <span>{t('settings.themeDark') || 'Mode Nuit (Sombre)'}</span>
            </span>
            {theme === 'dark' && <span className="h-2 w-2 rounded-full bg-cyan-400" />}
          </button>

          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold transition ${
              theme === 'light'
                ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                : 'bg-[#080e1e] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Sun className="h-4 w-4 text-amber-400" />
              <span>{t('settings.themeLight') || 'Mode Jour (Clair)'}</span>
            </span>
            {theme === 'light' && <span className="h-2 w-2 rounded-full bg-cyan-400" />}
          </button>
        </div>
      </div>

      {/* SECTION 1: PROFILE INFORMATION */}
      <form onSubmit={handleSaveProfile} className="rounded-3xl border border-slate-800/90 bg-[#0c1322]/90 p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-6">
        <div className="border-b border-slate-800/80 pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="h-4 w-4 text-cyan-400" />
            <span>{t('settings.profileInfo') || 'Informations du profil'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('settings.profileInfoDesc') || 'Ces informations sont visibles par les autres membres selon vos paramètres'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('settings.displayName') || 'Nom d’affichage'}
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#080e1e] px-3.5 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Présentez votre parcours, vos ambitions..."
              className="w-full rounded-xl border border-slate-800 bg-[#080e1e] p-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('profile.city') || 'Ville'}
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#080e1e] px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                {TUNISIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('profile.university') || 'Université / Institut'}
              </label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="Ex: ENIS Sfax, FSEG, INSAT..."
                className="w-full rounded-xl border border-slate-800 bg-[#080e1e] px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('profile.availability') || 'Disponibilité'}
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#080e1e] px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Few hours per week">Quelques heures/sem</option>
                <option value="Weekends">Weekends</option>
                <option value="Part-time">Temps partiel</option>
                <option value="Flexible">Flexible</option>
                <option value="Full-time">Temps plein</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('profile.format') || 'Format préféré'}
              </label>
              <select
                value={collaborationFormat}
                onChange={(e) => setCollaborationFormat(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#080e1e] px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="In person">En présentiel</option>
                <option value="Remote">À distance</option>
                <option value="Hybrid">Hybride</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('profile.experienceLevel') || 'Niveau d’expérience'}
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#080e1e] px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Beginner">Débutant</option>
                <option value="Intermediate">Intermédiaire</option>
                <option value="Experienced">Expérimenté</option>
              </select>
            </div>
          </div>
        </div>

        {/* PRIVACY & DISCOVERY */}
        <div className="border-t border-slate-800/80 pt-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            <span>{t('settings.privacy') || 'Paramètres de confidentialité'}</span>
          </h2>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#080e1e] border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-white block">
                {t('settings.discoverableToggle') || 'Visible dans l’onglet Découverte'}
              </span>
              <p className="text-[11px] text-slate-400">
                {t('settings.discoverableDesc') || 'Permet aux autres membres de trouver votre profil via le matching'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={discoverable}
                onChange={(e) => setDiscoverable(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('settings.profileVisibility') || 'Visibilité du profil'}
            </label>
            <select
              value={profileVisibility}
              onChange={(e) =>
                setProfileVisibility(
                  e.target.value as 'public' | 'connections_only' | 'private'
                )
              }
              className="w-full rounded-xl border border-slate-800 bg-[#080e1e] px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="public">Public (Tout membre peut consulter)</option>
              <option value="connections_only">Connexions uniquement</option>
              <option value="private">Privé (Masqué)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-xl shadow-md shadow-cyan-500/20 border border-cyan-400/30 transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{t('common.saving') || 'Enregistrement...'}</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>{t('settings.saveChanges') || 'Enregistrer les modifications'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* SECTION 3: BLOCKED USERS */}
      <div className="rounded-3xl border border-slate-800/90 bg-[#0c1322]/90 p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Ban className="h-4 w-4 text-rose-400" />
          <span>{t('settings.blockedUsers') || 'Utilisateurs bloqués'} ({blockedUsers.length})</span>
        </h2>
        <p className="text-xs text-slate-400">
          {t('settings.blockedDesc') || 'Les personnes bloquées ne peuvent plus voir votre profil ni vous envoyer de messages.'}
        </p>

        {blockedUsers.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {blockedUsers.map((b) => (
              <div
                key={b.blocked_id}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-white">
                    {b.profile?.display_name || 'Utilisateur bloqué'}
                  </p>
                  <p className="text-[11px] text-slate-400">{b.profile?.city}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUnblock(b.blocked_id)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                >
                  {t('settings.unblock') || 'Débloquer'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">
            {t('settings.noBlocked') || t('settings.noBlockedUsers') || 'Aucun utilisateur bloqué.'}
          </p>
        )}
      </div>

      {/* SECTION 4: LOGOUT / DÉCONNEXION */}
      <div className="rounded-3xl border border-slate-800/80 bg-[#0c1322]/80 p-6 sm:p-8 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <LogOut className="h-4 w-4 text-cyan-400 rtl-flip" />
            <span>{t('navigation.logout') || 'Déconnexion'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {locale === 'ar'
              ? 'تسجيل الخروج من جلستك الحالية على منصة فكرتنا'
              : locale === 'en'
              ? 'Sign out of your active session on Fekretna'
              : 'Déconnectez-vous de votre session active sur Fekretna'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-600 border border-rose-800/50 hover:border-rose-600 rounded-xl shadow-md transition-all self-start sm:self-auto disabled:opacity-50 cursor-pointer"
        >
          {loggingOut ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{t('common.loading') || 'Déconnexion...'}</span>
            </>
          ) : (
            <>
              <LogOut className="h-3.5 w-3.5 rtl-flip" />
              <span>{t('navigation.logout') || 'Se déconnecter'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
