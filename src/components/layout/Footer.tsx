'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { FekretnaLogo } from '@/components/ui/FekretnaLogo';

export function Footer() {
  const { t, isRtl } = useI18n();

  const cities = ['Sfax', 'Tunis', 'Sousse', 'Gabès', 'Monastir', 'Bizerte', 'Nabeul', 'Kairouan'];

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#050810] text-slate-600 dark:text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <FekretnaLogo size={36} withGlow />
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">Fekretna</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/70 border border-cyan-300 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 font-arabic">
                من فكرة لفريق
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('landing.tagline') || 'من فكرة لفريق — La plateforme tunisienne pour trouver son associé, former son équipe et bâtir son projet entrepreneurial.'}
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-200 dark:border-cyan-500/30 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>{t('landing.initiativeBadge') || 'Écosystème Tunisie'}</span>
            </div>
          </div>

          {/* Navigation Col */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">
              {t('navigation.platform') || 'Plateforme'}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/explore" className="hover:text-cyan-600 dark:hover:text-cyan-300 transition">
                  {t('navigation.exploreProjects') || 'Explorer les projets'}
                </Link>
              </li>
              <li>
                <Link href="/app/discover" className="hover:text-cyan-600 dark:hover:text-cyan-300 transition">
                  {t('navigation.findTeam') || 'Trouver des cofondateurs'}
                </Link>
              </li>
              <li>
                <Link href="/app/projects/new" className="hover:text-cyan-600 dark:hover:text-cyan-300 transition">
                  {t('projects.createProject') || 'Publier une idée'}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-cyan-600 dark:hover:text-cyan-300 transition">
                  {t('navigation.about') || 'À propos de Fekretna'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Community */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">
              {t('landing.trustTitle') || 'Confiance & Sécurité'}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/about#charte" className="hover:text-cyan-600 dark:hover:text-cyan-300 transition">
                  {t('landing.charter') || 'Charte de collaboration'}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-cyan-600 dark:hover:text-cyan-300 transition">
                  {t('landing.privacy') || 'Politique de confidentialité'}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-cyan-600 dark:hover:text-cyan-300 transition">
                  {t('landing.terms') || 'Conditions d’utilisation'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Cities / Expansion */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">
              {t('landing.regionsTitle') || 'Pôles universitaires'}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {cities.map((city) => (
                <span
                  key={city}
                  className="text-xs bg-slate-200/80 dark:bg-[#0b1120] text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-800 px-2 py-0.5 rounded-lg"
                >
                  {city}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              {t('landing.regionsDesc') || 'Ouvert à tous les instituts, universités et incubateurs de Tunisie.'}
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Fekretna. {t('common.allRightsReserved') || 'Tous droits réservés.'}</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>{t('landing.madeWith') || 'Conçu avec'}</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 inline" />
            <span>{t('landing.forTunisia') || 'pour la jeunesse et l’entrepreneuriat tunisien.'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
