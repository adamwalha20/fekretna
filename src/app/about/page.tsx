import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Rocket, Target, ShieldCheck, MapPin, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Header */}
          <div className="text-center space-y-4 mb-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-100/70 px-3.5 py-1 text-xs font-semibold text-teal-800">
              <Rocket className="h-3.5 w-3.5" />
              À propos de Fekretna
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              من فكرة لفريق — De ton idée à ton équipe
            </h1>
            <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Fekretna est née d’un constat simple : des milliers d’étudiants et jeunes talents tunisiens ont d’excellentes compétences et des idées prometteuses, mais peinent à trouver le partenaire idéal pour se lancer.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 mb-4">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Notre Mission</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Faciliter la rencontre entre profils techniques, commerciaux, créatifs et opérationnels pour transformer des idées brutes en projets concrets.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 mb-4">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Ancrage Local</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Démarrage ciblé à Sfax, grand pôle universitaire et industriel, avec une architecture prête pour couvrir toute la Tunisie.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Confiance Mutuelle</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Un environnement respectueux, sans faux profils, avec des outils stricts de signalement et de blocage pour protéger la communauté.
              </p>
            </div>
          </div>

          {/* Charte de collaboration */}
          <div id="charte" className="rounded-3xl border border-teal-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-teal-600" />
              Charte de collaboration Fekretna
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>
                <strong>1. Respect et bienveillance :</strong> Chaque membre s’engage à échanger de manière professionnelle et respectueuse, indépendamment du niveau d’expérience ou du domaine d’études.
              </p>
              <p>
                <strong>2. Transparence sur l’engagement :</strong> Soyez honnête quant à vos disponibilités réelles et vos motivations dès le premier contact.
              </p>
              <p>
                <strong>3. Protection des idées :</strong> Ne partagez pas de code secret ou de brevets non déposés. Concentrez-vous sur la vision, les besoins en compétences et la complémentarité d’équipe.
              </p>
              <p>
                <strong>4. Tolérance zéro pour le spam :</strong> Tout démarchage commercial intrusif, harcèlement ou fausse identité entraîne la suspension immédiate du compte.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
