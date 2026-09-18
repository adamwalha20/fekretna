import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">
              Conditions d&apos;Utilisation — Fekretna
            </h1>
            <p className="text-xs text-slate-400">Dernière mise à jour : 17 Septembre 2026</p>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <h2 className="text-base font-semibold text-slate-900">1. Objet de la plateforme</h2>
              <p>
                Fekretna est un outil communautaire destiné à faciliter la rencontre et la collaboration entrepreneuriale entre étudiants, diplômés et entrepreneurs en Tunisie.
              </p>

              <h2 className="text-base font-semibold text-slate-900">2. Responsabilité des projets publiés</h2>
              <p>
                Les utilisateurs sont seuls responsables des informations qu&apos;ils publient dans leurs projets. Fekretna recommande expressément de ne pas publier de secrets industriels ou de technologies brevetables avant d&apos;avoir établi les accords juridiques appropriés.
              </p>

              <h2 className="text-base font-semibold text-slate-900">3. Comportement des membres</h2>
              <p>
                Tout comportement injurieux, discrimination, harcèlement ou tentative d&apos;escroquerie fera l&apos;objet d&apos;une exclusion immédiate de la plateforme.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
