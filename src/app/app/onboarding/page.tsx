'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Rocket,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Loader2,
  Plus,
  User,
  Layers,
  Heart,
  Search,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TUNISIAN_CITIES } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import confetti from 'canvas-confetti';

const SKILLS_BY_CATEGORY = {
  Technology: [
    'Web development',
    'Mobile development',
    'Backend development',
    'Python',
    'AI and machine learning',
    'Data science',
    'Automation',
    'Cybersecurity',
  ],
  Business: [
    'Business development',
    'Entrepreneurship',
    'Sales',
    'Marketing',
    'Finance',
    'Business strategy',
  ],
  Creative: [
    'UI/UX design',
    'Graphic design',
    'Video editing',
    'Content creation',
    'Branding',
  ],
  Other: [
    'Product management',
    'Operations',
    'Research',
    'Public speaking',
  ],
};

const DEFAULT_INTERESTS = [
  'AI & Machine Learning',
  'SaaS',
  'E-commerce',
  'FinTech',
  'EdTech',
  'GreenTech & Sustainability',
  'Robotics & IoT',
  'Gaming',
  'Digital services',
  'Local businesses (Sfax & Tunisia)',
  'Social impact',
];

const LOOKING_FOR_ROLES = [
  'Co-fondateur (Associé)',
  'Développeur (Tech / IA)',
  'Designer UI/UX & Produit',
  'Marketing & Growth',
  'Partenaire Business & Vente',
  'Partenaire Technique',
  'Investisseur / Mentor',
  'Membre d’équipe passionné',
];

const COLLABORATION_GOALS = [
  'J’ai une idée et je cherche une équipe',
  'Je veux rejoindre un projet existant',
  'Je cherche un cofondateur associé',
  'Je veux explorer des opportunités de business',
  'Je souhaite collaborer sur un side-project',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { t, isRtl } = useI18n();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('Sfax');
  const [customCity, setCustomCity] = useState('');
  const [university, setUniversity] = useState('');
  const [bio, setBio] = useState('');

  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Web development']);
  const [customSkillInput, setCustomSkillInput] = useState('');

  const [selectedInterests, setSelectedInterests] = useState<string[]>(['AI & Machine Learning']);
  const [customInterestInput, setCustomInterestInput] = useState('');

  const [lookingFor, setLookingFor] = useState<string[]>([LOOKING_FOR_ROLES[0]]);
  const [collaborationGoal, setCollaborationGoal] = useState(COLLABORATION_GOALS[0]);
  const [collaborationFormat, setCollaborationFormat] = useState<'In person' | 'Remote' | 'Hybrid'>('Hybrid');
  const [availability, setAvailability] = useState<'Few hours per week' | 'Weekends' | 'Part-time' | 'Flexible' | 'Full-time'>('Part-time');
  const [experienceLevel, setExperienceLevel] = useState<'Beginner' | 'Intermediate' | 'Experienced'>('Intermediate');
  const [isInterestedInBusiness, setIsInterestedInBusiness] = useState('Yes');

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.display_name) {
          setDisplayName(profile.display_name);
        } else if (user.user_metadata?.display_name) {
          setDisplayName(user.user_metadata.display_name);
        }
      }
    }
    loadUser();
  }, []);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    if (customSkillInput.trim() && !selectedSkills.includes(customSkillInput.trim())) {
      setSelectedSkills([...selectedSkills, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const addCustomInterest = () => {
    if (customInterestInput.trim() && !selectedInterests.includes(customInterestInput.trim())) {
      setSelectedInterests([...selectedInterests, customInterestInput.trim()]);
      setCustomInterestInput('');
    }
  };

  const toggleLookingFor = (role: string) => {
    if (lookingFor.includes(role)) {
      setLookingFor(lookingFor.filter((r) => r !== role));
    } else {
      setLookingFor([...lookingFor, role]);
    }
  };

  const finalCity = city === 'Autre' && customCity.trim() ? customCity.trim() : city;

  const handleFinishOnboarding = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t('errors.unauthorized') || 'Session expirée. Veuillez vous reconnecter.');

      // 1. Update Profile record with onboarding_completed = true and valid columns
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: displayName.trim(),
          city: finalCity,
          university: university.trim() || null,
          bio: bio.trim() || null,
          collaboration_goals: [collaborationGoal, ...lookingFor.map((r) => `Recherche: ${r}`)],
          collaboration_format: collaborationFormat,
          availability,
          experience_level: experienceLevel,
          is_interested_in_business: isInterestedInBusiness,
          discoverable: true,
          profile_visibility: 'public',
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // 2. Clear previous and insert new Skills
      await supabase.from('profile_skills').delete().eq('profile_id', user.id);
      for (const skillName of selectedSkills) {
        const { data: skillRecord } = await supabase
          .from('skills')
          .select('id')
          .eq('name', skillName)
          .maybeSingle();

        let skillId = skillRecord?.id;
        if (!skillId) {
          const { data: newSkill, error: newSkillErr } = await supabase
            .from('skills')
            .insert({ name: skillName, category: 'Other' })
            .select('id')
            .maybeSingle();
          if (newSkillErr) {
            const { data: existing } = await supabase
              .from('skills')
              .select('id')
              .eq('name', skillName)
              .maybeSingle();
            skillId = existing?.id;
          } else {
            skillId = newSkill?.id;
          }
        }

        if (skillId) {
          await supabase
            .from('profile_skills')
            .upsert({ profile_id: user.id, skill_id: skillId }, { onConflict: 'profile_id,skill_id' });
        }
      }

      // 3. Clear previous and insert new Interests
      await supabase.from('profile_interests').delete().eq('profile_id', user.id);
      for (const interestName of selectedInterests) {
        const { data: interestRecord } = await supabase
          .from('interests')
          .select('id')
          .eq('name', interestName)
          .maybeSingle();

        let interestId = interestRecord?.id;
        if (!interestId) {
          const { data: newInterest, error: newInterestErr } = await supabase
            .from('interests')
            .insert({ name: interestName, category: 'General' })
            .select('id')
            .maybeSingle();
          if (newInterestErr) {
            const { data: existing } = await supabase
              .from('interests')
              .select('id')
              .eq('name', interestName)
              .maybeSingle();
            interestId = existing?.id;
          } else {
            interestId = newInterest?.id;
          }
        }

        if (interestId) {
          await supabase
            .from('profile_interests')
            .upsert({ profile_id: user.id, interest_id: interestId }, { onConflict: 'profile_id,interest_id' });
        }
      }

      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch {
        // fallback
      }

      router.push('/app');
      router.refresh();
    } catch (err: unknown) {
      console.error('Onboarding save error:', err);
      let msg = 'Erreur lors de l’enregistrement';
      if (err instanceof Error) {
        msg = err.message;
      } else if (err && typeof err === 'object') {
        const anyErr = err as Record<string, unknown>;
        if (typeof anyErr.message === 'string') {
          msg = anyErr.message;
        } else if (typeof anyErr.error_description === 'string') {
          msg = anyErr.error_description;
        } else if (typeof anyErr.details === 'string') {
          msg = anyErr.details;
        }
      }
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const stepsInfo = [
    { num: 1, label: t('onboarding.step1Label') || 'Profil' },
    { num: 2, label: t('onboarding.step2Label') || 'Compétences' },
    { num: 3, label: t('onboarding.step3Label') || 'Intérêts' },
    { num: 4, label: t('onboarding.step4Label') || 'Recherche' },
    { num: 5, label: t('onboarding.step5Label') || 'Préférences' },
    { num: 6, label: t('onboarding.step6Label') || 'Aperçu' },
  ];

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Background cyber ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[20rem] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Top Language Selector */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSelector compact={true} />
      </div>

      <div className="mx-auto max-w-2xl">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-lg border border-cyan-400/40">
              <Rocket className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-2xl text-white tracking-tight">Fekretna</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-arabic">
              من فكرة لفريق
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('onboarding.title') || 'Finalisez votre identité de fondateur'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('onboarding.subtitle') || 'Aidez la communauté à comprendre qui vous êtes et ce que vous construisez'}
          </p>

          {/* Stepper with Circles & Labels */}
          <div className="mt-6">
            <div className="flex items-center justify-between max-w-lg mx-auto relative">
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 -z-0" />
              <div
                className="absolute left-4 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300 -z-0 shadow-[0_0_8px_#22d3ee]"
                style={{ width: `${((step - 1) / 5) * 88}%` }}
              />

              {stepsInfo.map((s) => {
                const isCompleted = step > s.num;
                const isCurrent = step === s.num;

                return (
                  <div key={s.num} className="flex flex-col items-center relative z-10">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                        isCompleted
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-extrabold'
                          : isCurrent
                          ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/20 shadow-lg shadow-cyan-500/40 font-extrabold'
                          : 'bg-[#0c1322] border-2 border-slate-700 text-slate-500'
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : s.num}
                    </div>
                    <span
                      className={`mt-1.5 text-[10px] font-medium hidden sm:block ${
                        isCurrent
                          ? 'text-cyan-300 font-bold'
                          : isCompleted
                          ? 'text-slate-300'
                          : 'text-slate-500'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step Container */}
        <div className="rounded-3xl border border-slate-800/90 bg-[#0c1322]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-cyan-400" />
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {t('onboarding.step1Heading') || '01 — À propos de vous'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {t('onboarding.step1Sub') || 'Présentez-vous à l’écosystème entrepreneurial tunisien'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('onboarding.nameLabel') || 'Nom d’affichage'} *
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ex: Yassine Trabelsi"
                  className="w-full rounded-2xl border border-slate-800 bg-[#080e1e] px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('onboarding.cityLabel') || 'Ville / Région'} *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-[#080e1e] px-4 py-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  {TUNISIAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {city === 'Autre' && (
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    placeholder="Précisez votre ville en Tunisie"
                    className="mt-2 w-full rounded-2xl border border-slate-800 bg-[#080e1e] px-4 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('onboarding.univLabel') || 'Université / Institut / Parcours'}
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="Ex: ENIS Sfax, FSEG Sfax, INSAT, IHEC..."
                  className="w-full rounded-2xl border border-slate-800 bg-[#080e1e] px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('onboarding.bioLabel') || 'Courte biographie'}
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ex: Développeur passionné d’IA et de GreenTech cherchant un associé commercial pour lancer une startup à Sfax..."
                  className="w-full rounded-2xl border border-slate-800 bg-[#080e1e] p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Skills Selection */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-cyan-400" />
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {t('onboarding.step2Heading') || '02 — Vos compétences clés'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {t('onboarding.step2Sub') || 'Sélectionnez vos expertises pour le calcul de synergie'}
                  </p>
                </div>
              </div>

              {Object.entries(SKILLS_BY_CATEGORY).map(([category, skills]) => (
                <div key={category}>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => {
                      const isSelected = selectedSkills.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSkill(s)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                            isSelected
                              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20 border border-cyan-400/40'
                              : 'bg-[#080e1e] border border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                          <span>{s}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('onboarding.customSkill') || 'Autre compétence'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomSkill();
                      }
                    }}
                    placeholder="Ex: Flutter, SEO, Comptabilité..."
                    className="flex-1 rounded-xl border border-slate-800 bg-[#080e1e] px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 hover:bg-cyan-900/60 rounded-xl"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t('common.add') || 'Ajouter'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Interests */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-indigo-400" />
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {t('onboarding.step3Heading') || '03 — Vos centres d’intérêt & secteurs'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {t('onboarding.step3Sub') || 'Dans quels domaines de startups aimeriez-vous entreprendre ?'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {DEFAULT_INTERESTS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-medium transition ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20 border border-cyan-400/40'
                          : 'bg-[#080e1e] border border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('onboarding.customInterest') || 'Autre centre d’intérêt'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customInterestInput}
                    onChange={(e) => setCustomInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomInterest();
                      }
                    }}
                    placeholder="Ex: AgriTech, BioTech, Logistique..."
                    className="flex-1 rounded-xl border border-slate-800 bg-[#080e1e] px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCustomInterest}
                    className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 hover:bg-cyan-900/60 rounded-xl"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t('common.add') || 'Ajouter'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: What are you looking for? */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-cyan-400" />
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {t('onboarding.step4Heading') || '04 — Que recherchez-vous ?'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {t('onboarding.step4Sub') || 'Sélectionnez les rôles ou associés que vous espérez trouver'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {LOOKING_FOR_ROLES.map((role) => {
                  const isSelected = lookingFor.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleLookingFor(role)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold transition text-left ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-500/10'
                          : 'bg-[#080e1e] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{role}</span>
                      {isSelected ? (
                        <span className="h-5 w-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold">✓</span>
                      ) : (
                        <span className="h-5 w-5 rounded-full border border-slate-700" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {t('onboarding.primaryGoal') || 'Votre objectif principal'}
                </label>
                <div className="space-y-2">
                  {COLLABORATION_GOALS.map((g) => (
                    <label
                      key={g}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-medium cursor-pointer transition ${
                        collaborationGoal === g
                          ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300'
                          : 'border-slate-800 bg-[#080e1e] text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="collaborationGoal"
                        value={g}
                        checked={collaborationGoal === g}
                        onChange={() => setCollaborationGoal(g)}
                        className="text-cyan-500 focus:ring-cyan-500"
                      />
                      <span>{g}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Collaboration Preferences */}
          {step === 5 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-teal-400" />
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {t('onboarding.step5Heading') || '05 — Préférences de collaboration'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {t('onboarding.step5Sub') || 'Définissez votre disponibilité et votre format de travail'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('profile.format') || 'Format de collaboration'}
                  </label>
                  <select
                    value={collaborationFormat}
                    onChange={(e) =>
                      setCollaborationFormat(
                        e.target.value as 'In person' | 'Remote' | 'Hybrid'
                      )
                    }
                    className="w-full rounded-2xl border border-slate-800 bg-[#080e1e] px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="In person">{t('profile.inPerson') || 'En présentiel'}</option>
                    <option value="Remote">{t('profile.remote') || 'À distance (Remote)'}</option>
                    <option value="Hybrid">{t('profile.hybrid') || 'Hybride'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('profile.availability') || 'Disponibilité'}
                  </label>
                  <select
                    value={availability}
                    onChange={(e) =>
                      setAvailability(
                        e.target.value as 'Few hours per week' | 'Weekends' | 'Part-time' | 'Flexible' | 'Full-time'
                      )
                    }
                    className="w-full rounded-2xl border border-slate-800 bg-[#080e1e] px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Few hours per week">Quelques heures par semaine</option>
                    <option value="Weekends">Weekends uniquement</option>
                    <option value="Part-time">Temps partiel</option>
                    <option value="Flexible">Flexible</option>
                    <option value="Full-time">Temps plein</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('profile.experienceLevel') || 'Niveau d’expérience'}
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) =>
                      setExperienceLevel(
                        e.target.value as 'Beginner' | 'Intermediate' | 'Experienced'
                      )
                    }
                    className="w-full rounded-2xl border border-slate-800 bg-[#080e1e] px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Beginner">Débutant (étudiant / curieux)</option>
                    <option value="Intermediate">Intermédiaire (projets passés)</option>
                    <option value="Experienced">Expérimenté (diplômé / pro)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('onboarding.businessGoal') || 'Intéressé par la création d’entreprise ?'}
                  </label>
                  <select
                    value={isInterestedInBusiness}
                    onChange={(e) => setIsInterestedInBusiness(e.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-[#080e1e] px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Yes">Oui, absolument</option>
                    <option value="Maybe">Peut-être / Selon le projet</option>
                    <option value="Exploring">En phase d’exploration</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Profile Preview & Confirmation */}
          {step === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {t('onboarding.step6Heading') || '06 — Aperçu de votre profil Fekretna'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {t('onboarding.step6Sub') || 'Vérifiez vos informations avant d’accéder à la plateforme'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#080e1e] p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-extrabold text-xl shadow-md border border-cyan-400/40">
                    {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{displayName}</h3>
                    <p className="text-xs text-slate-400">
                      {finalCity} • {experienceLevel}
                    </p>
                    {university && (
                      <p className="text-xs text-cyan-400 mt-0.5">{university}</p>
                    )}
                  </div>
                </div>

                {bio && (
                  <p className="text-xs text-slate-300 italic bg-[#0c1322] p-3 rounded-xl border border-slate-800">
                    &ldquo;{bio}&rdquo;
                  </p>
                )}

                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    {t('onboarding.primaryGoal') || 'Objectif principal'} :
                  </span>
                  <p className="text-xs text-slate-200 font-medium">{collaborationGoal}</p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    {t('onboarding.lookingFor') || 'Profils recherchés'} :
                  </span>
                  <p className="text-xs text-cyan-300 font-medium">{lookingFor.join(', ')}</p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    {t('profile.skills') || 'Compétences'} ({selectedSkills.length}) :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSkills.map((s) => (
                      <span
                        key={s}
                        className="text-[11px] px-2.5 py-0.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    {t('profile.interests') || 'Centres d’intérêt'} ({selectedInterests.length}) :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInterests.map((i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-0.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-medium"
                      >
                        {i}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Format : {collaborationFormat}</span>
                  <span>Disponibilité : {availability}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              >
                <ChevronLeft className="h-4 w-4 rtl-flip" />
                <span>{t('common.prev') || 'Précédent'}</span>
              </button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !displayName.trim()) {
                    alert(t('onboarding.nameRequired') || 'Veuillez saisir votre nom complet.');
                    return;
                  }
                  setStep(step + 1);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-xl shadow-md transition"
              >
                <span>{t('common.next') || 'Suivant'}</span>
                <ChevronRight className="h-4 w-4 rtl-flip" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleFinishOnboarding}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-xl shadow-lg shadow-cyan-500/25 border border-cyan-400/30 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('onboarding.saving') || 'Finalisation...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>{t('onboarding.accessPlatform') || 'Accéder à Fekretna'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
