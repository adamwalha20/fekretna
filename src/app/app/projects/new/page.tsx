'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Rocket,
  AlertTriangle,
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  Lightbulb,
  Target,
  Users,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { projectSchema } from '@/lib/validations';
import { TUNISIAN_CITIES } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';
import confetti from 'canvas-confetti';

const CATEGORIES = [
  'Technologie & IA',
  'E-commerce',
  'Marketing & Vente',
  'Design & Création',
  'Éducation (EdTech)',
  'FinTech & Finance',
  'Développement durable & AgriTech',
  'Services & B2B',
  'Autre idée business',
];

export default function NewProjectPage() {
  const router = useRouter();
  const { t, isRtl } = useI18n();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [solutionDescription, setSolutionDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [stage, setStage] = useState<'Idea' | 'Validation' | 'Prototype' | 'MVP' | 'Early launch' | 'Growing'>('Idea');
  const [city, setCity] = useState('Sfax');
  const [collaborationFormat, setCollaborationFormat] = useState<'In person' | 'Remote' | 'Hybrid'>('Hybrid');
  const [commitmentExpectation, setCommitmentExpectation] = useState('5 à 10h par semaine');
  const visibility = 'public';

  // Roles Needed
  const [roles, setRoles] = useState<{ role_name: string; description: string }[]>([
    { role_name: 'Cofondateur Tech / Développeur', description: 'Développement de la première version logicielle' },
  ]);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Skills Needed
  const [skills, setSkills] = useState<string[]>(['Web development', 'Business development']);
  const [newSkill, setNewSkill] = useState('');

  const handleAddRole = () => {
    if (newRoleName.trim()) {
      setRoles([...roles, { role_name: newRoleName.trim(), description: newRoleDesc.trim() }]);
      setNewRoleName('');
      setNewRoleDesc('');
    }
  };

  const handleRemoveRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    setSkills(skills.filter((s) => s !== skillName));
  };

  const validateStep = (currentStep: number): boolean => {
    setError(null);
    if (currentStep === 1) {
      if (!title.trim() || title.trim().length < 5) {
        setError('Le titre du projet doit contenir au moins 5 caractères.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!description.trim() || description.trim().length < 20) {
        setError('La description générale doit contenir au moins 20 caractères.');
        return false;
      }
      if (!problemDescription.trim() || problemDescription.trim().length < 10) {
        setError('Le problème ciblé doit contenir au moins 10 caractères.');
        return false;
      }
    } else if (currentStep === 4) {
      if (skills.length === 0) {
        setError('Veuillez ajouter au moins une compétence clé recherchée.');
        return false;
      }
    } else if (currentStep === 5) {
      if (roles.length === 0) {
        setError('Veuillez définir au moins un rôle ou type de profil recherché.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(6, prev + 1));
    }
  };

  const handlePrev = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        problemDescription: problemDescription.trim(),
        solutionDescription: solutionDescription.trim() || undefined,
        category,
        stage,
        city,
        collaborationFormat,
        commitmentExpectation: commitmentExpectation.trim(),
        visibility,
        rolesNeeded: roles.map((r) => r.role_name),
        skillsNeeded: skills,
      };

      const parseResult = projectSchema.safeParse(payload);
      if (!parseResult.success) {
        throw new Error(parseResult.error.errors[0]?.message || 'Données invalides');
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t('errors.unauthorized') || 'Veuillez vous connecter pour publier un projet.');

      // 1. Insert Project
      const { data: newProject, error: projError } = await supabase
        .from('projects')
        .insert({
          owner_id: user.id,
          title: payload.title,
          description: payload.description,
          problem_description: payload.problemDescription,
          solution_description: payload.solutionDescription || null,
          category: payload.category,
          stage: payload.stage,
          city: payload.city,
          collaboration_format: payload.collaborationFormat,
          commitment_expectation: payload.commitmentExpectation,
          visibility: payload.visibility,
          status: 'active',
        })
        .select('id')
        .single();

      if (projError) throw projError;
      const projectId = newProject.id;

      // 2. Insert Project Roles
      if (roles.length > 0) {
        const rolesToInsert = roles.map((r) => ({
          project_id: projectId,
          role_name: r.role_name,
          description: r.description || null,
          filled: false,
        }));
        await supabase.from('project_roles').insert(rolesToInsert);
      }

      // 3. Insert Skills
      for (const skillName of skills) {
        let skillId: string | null = null;
        const { data: existingSkill } = await supabase
          .from('skills')
          .select('id')
          .eq('name', skillName)
          .maybeSingle();

        if (existingSkill?.id) {
          skillId = existingSkill.id;
        } else {
          const { data: createdSkill, error: createSkillErr } = await supabase
            .from('skills')
            .insert({ name: skillName, category: 'Other' })
            .select('id')
            .maybeSingle();
          if (createSkillErr) {
            console.warn('Skill insert error:', createSkillErr);
          }
          skillId = createdSkill?.id || null;
        }

        if (skillId) {
          await supabase.from('project_skills').insert({
            project_id: projectId,
            skill_id: skillId,
          });
        }
      }

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {
        // fallback
      }

      router.push(`/app/projects/${projectId}`);
      router.refresh();
    } catch (err: unknown) {
      console.error('Project creation error:', err);
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Une erreur est survenue lors de la création du projet.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { num: 1, label: t('projects.step1') || 'Idée' },
    { num: 2, label: t('projects.step2') || 'Description' },
    { num: 3, label: t('projects.step3') || 'Catégorie' },
    { num: 4, label: t('projects.step4') || 'Compétences' },
    { num: 5, label: t('projects.step5') || 'Rôles' },
    { num: 6, label: t('projects.step6') || 'Publication' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      <Link
        href="/app/projects"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition"
      >
        <ArrowLeft className="h-3.5 w-3.5 rtl-flip" />
        <span>{t('projects.backToProjects') || 'Retour à mes projets'}</span>
      </Link>

      <div className="rounded-3xl border border-slate-800/90 bg-[#0c1322]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Header & Step Progress Indicator */}
        <div className="border-b border-slate-800/80 pb-6 mb-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {t('projects.createTitle') || 'Créer un projet'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                من فكرة لفريق — {t('projects.step') || 'Étape'} {step} / 6
              </p>
            </div>
            <span className="font-mono text-xs px-3 py-1 rounded-xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-bold">
              {Math.round((step / 6) * 100)}%
            </span>
          </div>

          {/* Stepper bar */}
          <div className="grid grid-cols-6 gap-1.5">
            {stepsList.map((s) => (
              <div key={s.num} className="flex flex-col gap-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s.num <= step
                      ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_0_8px_#22d3ee]'
                      : 'bg-slate-800'
                  }`}
                />
                <span className="text-[10px] text-slate-500 hidden sm:block truncate text-center">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Confidentiality Alert */}
        <div className="mb-6 rounded-2xl bg-cyan-950/30 p-4 border border-cyan-500/20 flex items-start gap-3 text-xs text-cyan-200">
          <AlertTriangle className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5 text-cyan-300">
              {t('projects.confidentialityNotice') || 'Rappel de confidentialité :'}
            </span>
            <p className="text-slate-400 leading-relaxed">
              {t('projects.noticeWarning') || 'Partagez la vision, la proposition de valeur et les défis sans divulguer d’éléments hautement confidentiels ou secrets industriels.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-rose-950/40 p-3.5 text-xs text-rose-300 border border-rose-500/30 animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: PROJECT IDEA */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {t('projects.step1Heading') || 'Quelle est l’idée de votre startup ?'}
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Donnez un titre clair et accrocheur qui résume votre projet.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('projects.titleLabel') || 'Nom du projet'} *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: SmartOlive Sfax — Traçabilité oléicole connectée"
                  className="w-full rounded-2xl border border-slate-800 bg-[#080e1e] px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: DESCRIPTION & PROBLEM */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {t('projects.step2Heading') || 'Décrivez la vision et le problème ciblé'}
                </h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('projects.descLabel') || 'Description générale'} *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Résumez la mission du projet et ce que vous souhaitez accomplir..."
                  className="w-full rounded-2xl border border-slate-800 bg-[#080e1e] p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('projects.problemLabel') || 'Problème ciblé en Tunisie'} *
                </label>
                <textarea
                  rows={2}
                  required
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Quel problème concret rencontrent vos utilisateurs cibles ?"
                  className="w-full rounded-2xl border border-slate-800 bg-[#080e1e] p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('projects.solutionLabel') || 'Ébauche de solution (optionnel)'}
                </label>
                <textarea
                  rows={2}
                  value={solutionDescription}
                  onChange={(e) => setSolutionDescription(e.target.value)}
                  placeholder="Comment envisagez-vous de répondre à ce défi ?"
                  className="w-full rounded-2xl border border-slate-800 bg-[#080e1e] p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3: CATEGORY & LOGISTICS */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {t('projects.step3Heading') || 'Catégorie, stade et organisation'}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('projects.categoryLabel') || 'Catégorie'} *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#080e1e] px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('projects.stageLabel') || 'Stade d’avancement'} *
                  </label>
                  <select
                    value={stage}
                    onChange={(e) =>
                      setStage(
                        e.target.value as 'Idea' | 'Validation' | 'Prototype' | 'MVP' | 'Early launch' | 'Growing'
                      )
                    }
                    className="w-full rounded-xl border border-slate-800 bg-[#080e1e] px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Idea">Idée (Concept initial)</option>
                    <option value="Validation">Validation (Étude marché / interviews)</option>
                    <option value="Prototype">Prototype (Maquette / PoC)</option>
                    <option value="MVP">MVP (Produit minimum viable)</option>
                    <option value="Early launch">Lancement préliminaire</option>
                    <option value="Growing">En croissance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('projects.cityLabel') || 'Ville principale'}
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
                    {t('projects.formatLabel') || 'Format de collaboration'}
                  </label>
                  <select
                    value={collaborationFormat}
                    onChange={(e) =>
                      setCollaborationFormat(
                        e.target.value as 'In person' | 'Remote' | 'Hybrid'
                      )
                    }
                    className="w-full rounded-xl border border-slate-800 bg-[#080e1e] px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="In person">En présentiel</option>
                    <option value="Remote">À distance (Remote)</option>
                    <option value="Hybrid">Hybride</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('projects.commitmentLabel') || 'Disponibilité attendue'}
                  </label>
                  <input
                    type="text"
                    value={commitmentExpectation}
                    onChange={(e) => setCommitmentExpectation(e.target.value)}
                    placeholder="Ex: 5 à 10h / semaine"
                    className="w-full rounded-xl border border-slate-800 bg-[#080e1e] px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REQUIRED SKILLS */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {t('projects.step4Heading') || 'Compétences recherchées'}
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Précisez les savoir-faire techniques, business ou design dont votre projet a besoin.
              </p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-xl text-xs font-medium"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-cyan-400 hover:text-rose-400 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Ex: React, Python, UI/UX, Vente B2B, Growth..."
                  className="flex-1 rounded-xl border border-slate-800 bg-[#080e1e] px-3.5 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 hover:bg-cyan-900/60 rounded-xl"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t('common.add') || 'Ajouter'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: ROLES SOUGHT */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {t('projects.step5Heading') || 'Quels profils d’associés cherchez-vous ?'}
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Définissez les postes de cofondateurs ou équipiers pour attirer les candidats idéaux.
              </p>

              <div className="space-y-2 mb-3">
                {roles.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#080e1e] border border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white">{r.role_name}</span>
                      {r.description && (
                        <span className="text-slate-400 block text-[11px] mt-0.5">
                          {r.description}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(i)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 p-3.5 rounded-2xl border border-slate-800 bg-[#080e1e]">
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Intitulé du rôle (ex: CTO / Développeur Mobile, Co-fondateur Marketing...)"
                  className="w-full rounded-xl border border-slate-700/60 bg-[#0c1322] px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Missions principales (ex: Architecture applicative, tests utilisateurs...)"
                  className="w-full rounded-xl border border-slate-700/60 bg-[#0c1322] px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddRole}
                  className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 hover:bg-cyan-900/60 rounded-xl"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t('projects.addRole') || 'Ajouter le rôle'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & PUBLISH */}
          {step === 6 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {t('projects.step6Heading') || 'Récapitulatif avant publication'}
                </h3>
              </div>

              <div className="rounded-2xl bg-[#080e1e] p-4 border border-slate-800 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">{t('projects.titleLabel') || 'Titre'} :</span>
                  <p className="font-bold text-white text-sm mt-0.5">{title}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">{t('projects.categoryLabel') || 'Catégorie & Stade'} :</span>
                  <p className="text-slate-200 mt-0.5">{category} • {stage} • {city} ({collaborationFormat})</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">{t('projects.descLabel') || 'Description'} :</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">{description}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">{t('projects.problemLabel') || 'Problème'} :</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">{problemDescription}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">{t('projects.rolesLabel') || 'Rôles ouverts'} :</span>
                  <p className="text-cyan-300 mt-0.5">{roles.map((r) => r.role_name).join(', ')}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">{t('projects.skillsLabel') || 'Compétences requises'} :</span>
                  <p className="text-slate-300 mt-0.5">{skills.join(', ')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              >
                <ArrowLeft className="h-3.5 w-3.5 rtl-flip" />
                <span>{t('common.prev') || 'Précédent'}</span>
              </button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-xl shadow-md transition"
              >
                <span>{t('common.next') || 'Suivant'}</span>
                <ArrowRight className="h-3.5 w-3.5 rtl-flip" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-xl shadow-lg shadow-cyan-500/25 border border-cyan-400/30 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('projects.publishing') || 'Publication en cours...'}</span>
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    <span>{t('projects.submit') || 'Publier le projet'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
