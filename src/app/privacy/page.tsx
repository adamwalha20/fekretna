import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">
              Politique de Confidentialité — Fekretna
            </h1>
            <p className="text-xs text-slate-400">Dernière mise à jour : 17 Septembre 2026</p>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <h2 className="text-base font-semibold text-slate-900">1. Données collectées</h2>
              <p>
                Fekretna collecte uniquement les données nécessaires à la mise en relation entre porteurs de projets et futurs coéquipiers : nom affiché, adresse email de connexion, ville, compétences, intérêts et préférences de collaboration.
              </p>

              <h2 className="text-base font-semibold text-slate-900">2. Confidentialité de l&apos;adresse email</h2>
              <p>
                Votre adresse email n&apos;est jamais rendue publique sur vos cartes de profil. Les échanges initiaux s&apos;effectuent exclusivement via la messagerie interne de Fekretna après acceptation mutuelle de la demande de connexion.
              </p>

              <h2 className="text-base font-semibold text-slate-900">3. Contrôle de visibilité</h2>
              <p>
                Vous pouvez à tout moment masquer votre profil de la découverte publique ou supprimer définitivement votre compte et l&apos;ensemble de vos données associées dans vos paramètres de compte.
              </p>

              <h2 className="text-base font-semibold text-slate-900">4. Sécurité</h2>
              <p>
                Toutes les requêtes et données de base de données sont protégées par les politiques de sécurité au niveau des lignes (Row-Level Security - RLS) de Supabase PostgreSQL.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
