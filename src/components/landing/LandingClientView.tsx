'use client';

import React from 'react';
import Link from 'next/link';
import {
  Rocket,
  Search,
  ArrowRight,
  ShieldCheck,
  Cpu,
  ShoppingBag,
  TrendingUp,
  Palette,
  GraduationCap,
  Leaf,
  Briefcase,
  Layers,
  Sparkles,
  Users,
  MessageSquare,
} from 'lucide-react';
import { Project, Skill, ProjectRole } from '@/types/database';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { Footer } from '@/components/layout/Footer';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { NetworkVisual } from '@/components/landing/NetworkVisual';
import { useI18n } from '@/lib/i18n/context';

interface LandingClientViewProps {
  featuredProjects: (Project & { skills?: Skill[]; roles?: ProjectRole[] })[];
}

export function LandingClientView({ featuredProjects }: LandingClientViewProps) {
  const { t } = useI18n();

  const categories = [
    { name: t('landing.catTech') || 'Technologie & IA', icon: Cpu, desc: 'Web, Mobile, IA, IoT, Cloud' },
    { name: t('landing.catEcommerce') || 'E-commerce & D2C', icon: ShoppingBag, desc: 'Marketplaces locales, Boutiques' },
    { name: t('landing.catMarketing') || 'Marketing & Growth', icon: TrendingUp, desc: 'Acquisition, Branding, Stratégie' },
    { name: t('landing.catDesign') || 'Design & Produit', icon: Palette, desc: 'UI/UX, Prototypage, Identité' },
    { name: t('landing.catEdTech') || 'Éducation (EdTech)', icon: GraduationCap, desc: 'Plateformes d’apprentissage' },
    { name: t('landing.catGreenTech') || 'Développement durable', icon: Leaf, desc: 'GreenTech, AgriTech, Éco-solutions' },
    { name: t('landing.catB2B') || 'Services & B2B', icon: Briefcase, desc: 'Automatisation, SaaS professionnel' },
    { name: t('landing.catOther') || 'Autres projets', icon: Layers, desc: 'Initiatives culturelles et sociales' },
  ];

  const steps = [
    {
      num: '01',
      title: t('landing.step1Title') || 'Crée ton profil',
      desc: t('landing.step1Desc') || 'Définis tes compétences clés (tech, business, design), tes centres d’intérêt, tes disponibilités et ce que tu recherches.',
      icon: Users,
    },
    {
      num: '02',
      title: t('landing.step2Title') || 'Découvre des personnes & projets',
      desc: t('landing.step2Desc') || 'Explore des profils aux compétences hautement complémentaires et découvre des idées de startups actives à Sfax et en Tunisie.',
      icon: Sparkles,
    },
    {
      num: '03',
      title: t('landing.step3Title') || 'Connecte-toi',
      desc: t('landing.step3Desc') || 'Envoie des demandes d’association ciblées accompagnées d’une note personnalisée pour initier le premier contact.',
      icon: MessageSquare,
    },
    {
      num: '04',
      title: t('landing.step4Title') || 'Construisez ensemble',
      desc: t('landing.step4Desc') || 'Collaborez dans un espace dédié, partagez vos visions et transformez votre idée commune en une startup concrète.',
      icon: Rocket,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-800 dark:selection:text-cyan-200">
      <LandingNavbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-10 pb-16 sm:py-24 lg:py-28 border-b border-slate-200 dark:border-slate-800/80">
          {/* Cyber Ambient lights & mesh backdrop */}
          <div className="absolute inset-0 bg-grid-cyber opacity-[0.03] dark:opacity-[0.05] pointer-events-none -z-10" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[30rem] bg-gradient-to-tr from-cyan-500/10 via-indigo-600/10 to-teal-400/5 rounded-full blur-[150px] pointer-events-none -z-10" />
          <div className="absolute top-1/3 left-6 sm:left-12 w-80 sm:w-96 h-80 sm:h-96 bg-indigo-600/10 dark:bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Headlines and Call to Actions */}
              <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                {/* Initiative Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50/90 dark:bg-cyan-950/70 px-4 py-1.5 text-xs font-semibold text-cyan-800 dark:text-cyan-300 border border-cyan-200/90 dark:border-cyan-500/30 shadow-xs dark:shadow-lg dark:shadow-cyan-500/10 hover:border-cyan-400/60 transition-all duration-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                  </span>
                  <span className="font-arabic text-sm font-bold">من فكرة لفريق</span>
                  <span className="text-cyan-400 dark:text-cyan-500">•</span>
                  <span>{t('landing.initiativeBadge') || 'Plateforme des jeunes talents tunisiens'}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] text-slate-900 dark:text-white leading-[1.08]">
                  {t('landing.heroHeadline1') || 'Transforme ton idée'} <br />
                  <span className="bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 dark:from-cyan-400 dark:via-teal-300 dark:to-indigo-400 bg-clip-text text-transparent">
                    {t('landing.heroHeadline2') || 'en projet réel.'}
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  {t('landing.heroSubtitle') || 'Trouve les bonnes personnes pour cofonder ta startup ou rejoindre une équipe ambitieuse. Conçu pour les étudiants, diplômés et jeunes entrepreneurs tunisiens.'}
                </p>

                {/* Main CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                  <Link
                    href="/signup"
                    className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-full shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 border border-cyan-300/40 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] landing-shimmer"
                  >
                    <Rocket className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                    <span>{t('landing.join') || 'Rejoindre Fekretna'}</span>
                  </Link>
                  <Link
                    href="/explore"
                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white bg-white/80 dark:bg-white/[0.04] hover:bg-slate-100/90 dark:hover:bg-white/[0.08] border border-slate-300/80 dark:border-white/15 rounded-full shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] backdrop-blur-md"
                  >
                    <Search className="h-4 w-4 text-cyan-600 dark:text-cyan-400 transition-transform duration-300 group-hover:scale-110" />
                    <span>{t('landing.exploreProjects') || 'Explorer les projets'}</span>
                  </Link>
                </div>

                {/* Sub-info */}
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center lg:justify-start gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>{t('landing.freeForStudents') || '100% gratuit pour les étudiants et fondateurs • Déployé pour Sfax, Tunis et toutes les régions'}</span>
                </p>
              </div>

              {/* Right Column: Futuristic Living Connection Network Visual */}
              <div className="lg:col-span-6 flex justify-center">
                <NetworkVisual />
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS: 4 STEPS */}
        <section className="py-20 sm:py-28 relative bg-white dark:bg-[#090e1c] border-b border-slate-200 dark:border-slate-800/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-100/80 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>{t('landing.howItWorksTag') || 'Méthode Fekretna'}</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                {t('landing.howItWorksTitle') || 'Comment fonctionne la plateforme ?'}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                {t('landing.howItWorksSubtitle') || 'Quatre étapes simples pour transformer une idée isolée en une startup florissante.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.num}
                    className="relative group rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/70 dark:bg-[#0d1527]/80 p-6 shadow-sm hover:shadow-md dark:shadow-xl hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <span className="font-mono text-xs font-extrabold text-cyan-700 dark:text-cyan-400 px-2.5 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/30">
                          {step.num}
                        </span>
                        <div className="h-10 w-10 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-300 group-hover:scale-110 transition">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center text-[11px] font-semibold text-cyan-700 dark:text-cyan-400">
                      <span>{t('common.step') || 'Étape'} {step.num}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* DOMAINS & CATEGORIES */}
        <section className="py-20 bg-slate-50 dark:bg-[#070a13] border-b border-slate-200 dark:border-slate-800/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider mb-2">
                {t('landing.categoriesTag') || 'Domaines & Opportunités'}
              </h2>
              <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('landing.categoriesTitle') || 'Explore les catégories de projets'}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {t('landing.categoriesSubtitle') || 'De la deep tech et l’intelligence artificielle au commerce, à l’agritech et aux services B2B.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.name}
                    href={`/explore?category=${encodeURIComponent(cat.name)}`}
                    className="flex flex-col p-5 rounded-3xl bg-white dark:bg-[#0c1322]/80 border border-slate-200 dark:border-slate-800/90 hover:border-cyan-500/50 hover:bg-slate-50/80 dark:hover:bg-[#0f192e] transition group shadow-xs hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-600 group-hover:text-white transition duration-300 mb-3.5">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {cat.desc}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* FEATURED PROJECTS (REAL DATA ONLY) */}
        <section className="py-20 bg-white dark:bg-[#090e1c] border-b border-slate-200 dark:border-slate-800/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider mb-1">
                  {t('landing.featuredProjectsTag') || 'Projets récents'}
                </h2>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {t('landing.featuredProjectsTitle') || 'Projets actifs sur Fekretna'}
                </p>
              </div>
              <Link
                href="/explore"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
              >
                <span>{t('landing.allProjects') || 'Tous les projets'}</span>
                <ArrowRight className="h-4 w-4 rtl-flip" />
              </Link>
            </div>

            {featuredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={t('landing.emptyProjectsTitle') || 'Soyez le premier à publier un projet !'}
                description={t('landing.emptyProjectsDesc') || 'Aucun projet public pour le moment. Partage ton idée pour trouver tes futurs coéquipiers.'}
                actionText={t('projects.createProject') || 'Créer un projet'}
                actionHref="/signup"
              />
            )}
          </div>
        </section>

        {/* TRUST & COMMUNITY */}
        <section className="py-20 bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 px-3.5 py-1 text-xs font-semibold">
                  <ShieldCheck className="h-4 w-4 text-cyan-700 dark:text-cyan-400" />
                  <span>{t('landing.securityBadge') || 'Sécurité & Éthique'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {t('landing.communityTrustTitle') || 'Une communauté bâtie sur la confiance et l’action'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('landing.communityTrustSubtitle') || 'Fekretna valorise le respect réciproque, la clarté des engagements et la protection des idées. Nos membres gardent la maîtrise de leurs informations et peuvent signaler ou bloquer tout comportement suspect.'}
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4]" />
                    {t('landing.trustPillar1') || 'Modération proactive'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <span className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_6px_#14b8a6]" />
                    {t('landing.trustPillar2') || 'Signalement et blocage instantanés'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_6px_#6366f1]" />
                    {t('landing.trustPillar3') || 'Chiffrement des messages'}
                  </div>
                </div>
              </div>

              {/* Ready CTA Card */}
              <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-cyan-950 to-indigo-950 p-8 sm:p-10 border border-cyan-500/30 shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition duration-500" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {t('landing.ctaCardTitle') || 'Prêt à donner vie à ton idée ?'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  {t('landing.ctaCardSubtitle') || 'Rejoins dès aujourd’hui les fondateurs et créateurs de Sfax et de toute la Tunisie.'}
                </p>
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 hover:from-cyan-300 hover:to-teal-200 rounded-full shadow-lg shadow-cyan-400/25 hover:shadow-cyan-400/40 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] landing-shimmer"
                >
                  <span>{t('landing.createProfileCta') || 'Créer mon profil gratuitement'}</span>
                  <ArrowRight className="h-4 w-4 rtl-flip transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
