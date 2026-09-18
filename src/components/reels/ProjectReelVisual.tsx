'use client';

import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  TrendingUp, 
  Palette, 
  Leaf, 
  GraduationCap, 
  Globe, 
  Rocket, 
  Share2 
} from 'lucide-react';

interface ProjectReelVisualProps {
  title: string;
  category: string;
  stage?: string;
  imageUrl?: string | null;
}

export function ProjectReelVisual({
  title,
  category,
  stage,
  imageUrl,
}: ProjectReelVisualProps) {
  const [imageError, setImageError] = useState(false);

  const catLower = (category || '').toLowerCase();

  // Pick theme styling and icon based on category
  let gradientClass = 'from-cyan-600 via-indigo-700 to-purple-900';
  let accentColor = '#06b6d4';
  let secondaryColor = '#818cf8';
  let IconComponent = Rocket;

  if (catLower.includes('tech') || catLower.includes('ia') || catLower.includes('ai') || catLower.includes('logiciel')) {
    gradientClass = 'from-cyan-500 via-blue-600 to-indigo-900';
    accentColor = '#22d3ee';
    secondaryColor = '#6366f1';
    IconComponent = Cpu;
  } else if (catLower.includes('finan') || catLower.includes('business') || catLower.includes('commerce') || catLower.includes('market')) {
    gradientClass = 'from-emerald-500 via-teal-700 to-slate-900';
    accentColor = '#10b981';
    secondaryColor = '#14b8a6';
    IconComponent = TrendingUp;
  } else if (catLower.includes('design') || catLower.includes('créa') || catLower.includes('art') || catLower.includes('média')) {
    gradientClass = 'from-fuchsia-500 via-purple-700 to-indigo-950';
    accentColor = '#d946ef';
    secondaryColor = '#a855f7';
    IconComponent = Palette;
  } else if (catLower.includes('éduc') || catLower.includes('etud') || catLower.includes('formation')) {
    gradientClass = 'from-blue-500 via-indigo-700 to-purple-900';
    accentColor = '#3b82f6';
    secondaryColor = '#8b5cf6';
    IconComponent = GraduationCap;
  } else if (catLower.includes('santé') || catLower.includes('vert') || catLower.includes('ecol') || catLower.includes('agri')) {
    gradientClass = 'from-emerald-600 via-teal-800 to-slate-950';
    accentColor = '#059669';
    secondaryColor = '#10b981';
    IconComponent = Leaf;
  }

  // If a real image exists and has not failed, display it
  if (imageUrl && !imageError) {
    return (
      <div className="relative w-full h-full overflow-hidden rounded-3xl bg-slate-950">
        <img
          src={imageUrl}
          alt={title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070a13] via-[#070a13]/50 to-transparent" />
      </div>
    );
  }

  // High-aesthetic procedural SVG visual for projects without photos
  return (
    <div className={`relative w-full h-full overflow-hidden rounded-3xl bg-gradient-to-br ${gradientClass} flex flex-col items-center justify-center p-8 select-none shadow-2xl shadow-black/40`}>
      {/* Background SVG abstract network mesh */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`glow-${title.replace(/\s+/g, '')}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <pattern
            id={`grid-${title.replace(/\s+/g, '')}`}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
            />
            <circle cx="0" cy="0" r="1.5" fill={accentColor} opacity="0.6" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill={`url(#grid-${title.replace(/\s+/g, '')})`} />

        {/* Orbiting futuristic cybernetic rings */}
        <circle cx="50%" cy="45%" r="120" stroke={secondaryColor} strokeWidth="1" fill="none" opacity="0.3" strokeDasharray="6 8" />
        <circle cx="50%" cy="45%" r="170" stroke={accentColor} strokeWidth="1.5" fill="none" opacity="0.2" strokeDasharray="12 12" />
        <circle cx="50%" cy="45%" r="220" stroke="white" strokeWidth="0.75" fill="none" opacity="0.1" />

        {/* Dynamic geometric connecting lines */}
        <line x1="15%" y1="20%" x2="50%" y2="45%" stroke={accentColor} strokeWidth="1.2" opacity="0.3" />
        <line x1="85%" y1="25%" x2="50%" y2="45%" stroke={secondaryColor} strokeWidth="1.2" opacity="0.3" />
        <line x1="30%" y1="75%" x2="50%" y2="45%" stroke="white" strokeWidth="1" opacity="0.2" />
        <line x1="75%" y1="70%" x2="50%" y2="45%" stroke={accentColor} strokeWidth="1" opacity="0.25" />

        {/* Ambient glow center */}
        <circle cx="50%" cy="45%" r="140" fill={`url(#glow-${title.replace(/\s+/g, '')})`} />
      </svg>

      {/* Cybernetic glowing icon centerpiece */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative group">
          <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-slate-950/60 backdrop-blur-xl border border-white/20 shadow-2xl shadow-cyan-500/20 transition-transform duration-500 hover:scale-110">
            <IconComponent className="h-12 w-12 sm:h-14 sm:w-14 text-white drop-shadow-[0_0_16px_rgba(255,255,255,0.7)]" />
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-cyan-400/40 to-indigo-500/40 blur-md -z-10 animate-pulse" />
          </div>
          <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/90 text-slate-950 shadow-md">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
        </div>

        {/* Project category pill badge */}
        <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/70 border border-white/15 text-xs font-semibold text-white/90 backdrop-blur-md shadow-lg">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }} />
          <span>{category}</span>
          {stage && (
            <>
              <span className="text-white/40">•</span>
              <span className="text-cyan-300">{stage}</span>
            </>
          )}
        </div>
      </div>

      {/* Vignette bottom gradient for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#070a13] via-[#070a13]/60 to-transparent pointer-events-none" />
    </div>
  );
}
