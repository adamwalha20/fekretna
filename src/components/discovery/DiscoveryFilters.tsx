'use client';

import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { TUNISIAN_CITIES } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';

export interface FilterState {
  search: string;
  city: string;
  format: string;
  stage: string;
  category: string;
  availability: string;
}

interface DiscoveryFiltersProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  categories?: string[];
  stages?: string[];
  showProjectFilters?: boolean;
}

export function DiscoveryFilters({
  filters,
  onChange,
  onReset,
  categories = ['Tech & IA', 'E-commerce', 'Marketing', 'FinTech', 'GreenTech', 'Education', 'Services'],
  stages = ['Idea', 'Validation', 'Prototype', 'MVP', 'Early launch', 'Growing'],
  showProjectFilters = false,
}: DiscoveryFiltersProps) {
  const { t, isRtl } = useI18n();

  const hasActiveFilters =
    filters.search ||
    filters.city ||
    filters.format ||
    filters.stage ||
    filters.category ||
    filters.availability;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1322]/90 p-4 sm:p-5 shadow-sm dark:shadow-xl backdrop-blur-xl mb-6">
      {/* Search Input Bar */}
      <div className="relative mb-3.5">
        <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-600 dark:text-cyan-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder={t('discovery.searchPlaceholder') || 'Rechercher par nom, compétence, mot-clé...'}
          className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#080e1e] py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 ${
            isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'
          }`}
        />
        {filters.search && (
          <button
            onClick={() => onChange({ ...filters, search: '' })}
            className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white ${isRtl ? 'left-3' : 'right-3'}`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Select Filter Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {/* City Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {t('discovery.filterCity') || 'Ville / Région'}
          </label>
          <select
            value={filters.city}
            onChange={(e) => onChange({ ...filters, city: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080e1e] px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">{t('discovery.allCities') || 'Toutes les villes'}</option>
            {TUNISIAN_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Format Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {t('discovery.filterFormat') || 'Format'}
          </label>
          <select
            value={filters.format}
            onChange={(e) => onChange({ ...filters, format: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080e1e] px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">{t('discovery.allFormats') || 'Tous les formats'}</option>
            <option value="In person">{t('profile.inPerson') || 'En présentiel'}</option>
            <option value="Remote">{t('profile.remote') || 'À distance'}</option>
            <option value="Hybrid">{t('profile.hybrid') || 'Hybride'}</option>
          </select>
        </div>

        {/* Project Stage Filter */}
        {showProjectFilters && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t('discovery.filterStage') || 'Maturité'}
            </label>
            <select
              value={filters.stage}
              onChange={(e) => onChange({ ...filters, stage: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080e1e] px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">{t('discovery.allStages') || 'Tous les stades'}</option>
              {stages.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {t('discovery.filterCategory') || 'Catégorie'}
          </label>
          <select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080e1e] px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">{t('discovery.allCategories') || 'Toutes catégories'}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Availability Filter */}
        {!showProjectFilters && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t('discovery.filterAvailability') || 'Disponibilité'}
            </label>
            <select
              value={filters.availability}
              onChange={(e) => onChange({ ...filters, availability: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080e1e] px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">{t('discovery.allAvailabilities') || 'Toutes disponibilités'}</option>
              <option value="Few hours per week">Quelques heures / sem</option>
              <option value="Weekends">Weekends</option>
              <option value="Part-time">Temps partiel</option>
              <option value="Flexible">Flexible</option>
              <option value="Full-time">Temps plein</option>
            </select>
          </div>
        )}

        {/* Reset Action */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium py-1.5 transition"
            >
              <X className="h-3.5 w-3.5" />
              {t('discovery.resetFilters') || 'Réinitialiser'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
