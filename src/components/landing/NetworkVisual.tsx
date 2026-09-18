'use client';

import React, { useState } from 'react';
import { Cpu, Palette, Briefcase, TrendingUp, Lightbulb, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export function NetworkVisual() {
  const { t } = useI18n();
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const nodes = [
    {
      id: 'dev',
      title: t('landing.networkDev') || 'Tech & IA',
      role: 'Développeur / Data Scientist',
      icon: Cpu,
      color: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.45)',
      bg: 'bg-cyan-50/90 dark:bg-[#08182b]/90',
      border: 'border-cyan-300 dark:border-cyan-500/40',
      text: 'text-cyan-800 dark:text-cyan-300',
      iconBg: 'bg-cyan-100 dark:bg-cyan-950/80',
      floatClass: 'landing-float-node-1',
      x: 75,
      y: 85,
      tags: ['React', 'Python', 'AI/ML', 'Next.js'],
    },
    {
      id: 'design',
      title: t('landing.networkDesign') || 'Design & UX',
      role: 'Product Designer / UI-UX',
      icon: Palette,
      color: '#c084fc',
      glow: 'rgba(192, 132, 252, 0.45)',
      bg: 'bg-purple-50/90 dark:bg-[#1a0f2e]/90',
      border: 'border-purple-300 dark:border-purple-500/40',
      text: 'text-purple-800 dark:text-purple-300',
      iconBg: 'bg-purple-100 dark:bg-purple-950/80',
      floatClass: 'landing-float-node-2',
      x: 345,
      y: 75,
      tags: ['Figma', 'UI/UX', 'Design System', '3D'],
    },
    {
      id: 'business',
      title: t('landing.networkBusiness') || 'Business & Stratégie',
      role: 'Cofondateur / Business Dev',
      icon: Briefcase,
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.45)',
      bg: 'bg-emerald-50/90 dark:bg-[#061d17]/90',
      border: 'border-emerald-300 dark:border-emerald-500/40',
      text: 'text-emerald-800 dark:text-emerald-300',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/80',
      floatClass: 'landing-float-node-3',
      x: 85,
      y: 325,
      tags: ['Finance', 'Business Plan', 'Pitch', 'Sales'],
    },
    {
      id: 'marketing',
      title: t('landing.networkMarketing') || 'Growth & Marketing',
      role: 'Growth Marketer / Acquisition',
      icon: TrendingUp,
      color: '#3b82f6',
      glow: 'rgba(59, 130, 246, 0.45)',
      bg: 'bg-blue-50/90 dark:bg-[#09152e]/90',
      border: 'border-blue-300 dark:border-blue-500/40',
      text: 'text-blue-800 dark:text-blue-300',
      iconBg: 'bg-blue-100 dark:bg-blue-950/80',
      floatClass: 'landing-float-node-4',
      x: 335,
      y: 315,
      tags: ['Acquisition', 'SEO', 'Content', 'Social Ads'],
    },
  ];

  const centerX = 210;
  const centerY = 200;

  return (
    <div className="relative mx-auto w-full max-w-lg aspect-square select-none flex items-center justify-center p-3 sm:p-4">
      {/* Ambient background glow behind network */}
      <div className="absolute inset-2 sm:inset-6 rounded-full bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-teal-500/10 blur-3xl -z-10 pointer-events-none" />

      {/* SVG Connecting Lines, Orbit Rings & Animated Laser Pulses */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 420 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="network-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Orbit Rings with subtle dash and rotation */}
        <g className="landing-orbit-slow" style={{ transformOrigin: `${centerX}px ${centerY}px` }}>
          <circle
            cx={centerX}
            cy={centerY}
            r="138"
            stroke="currentColor"
            className="text-slate-300/40 dark:text-white/[0.05]"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r="88"
            stroke="currentColor"
            className="text-cyan-500/25 dark:text-cyan-400/15"
            strokeWidth="1"
            strokeDasharray="3 6"
          />
        </g>

        {/* Dynamic Connector lines & Laser signals */}
        {nodes.map((node) => {
          const isActive = activeNode === node.id;
          const isDimmed = activeNode !== null && !isActive;

          return (
            <g key={node.id} className="transition-opacity duration-300" opacity={isDimmed ? 0.3 : 1}>
              {/* Base connector line */}
              <line
                x1={node.x}
                y1={node.y}
                x2={centerX}
                y2={centerY}
                stroke={node.color}
                strokeOpacity={isActive ? 0.85 : 0.25}
                strokeWidth={isActive ? 2.5 : 1.2}
                strokeDasharray={isActive ? 'none' : '4 4'}
                filter={isActive ? 'url(#network-glow)' : undefined}
                className="transition-all duration-300"
              />

              {/* Laser Light Pulse traveling between central idea and satellite node */}
              <circle r={isActive ? 3.5 : 2.5} fill={node.color} opacity={isActive ? 1 : 0.6}>
                <animateMotion
                  path={`M ${centerX} ${centerY} L ${node.x} ${node.y}`}
                  dur={`${2.6 + (node.x % 2)}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}
      </svg>

      {/* Central Node: IDÉE / PROJECT CORE */}
      <div
        className="absolute z-20 flex flex-col items-center justify-center p-3 sm:p-4 rounded-3xl bg-white/95 dark:bg-[#070b16]/95 border-2 border-cyan-400 dark:border-cyan-400/80 shadow-xl dark:shadow-2xl shadow-cyan-500/25 dark:shadow-cyan-500/35 backdrop-blur-2xl transition-all duration-300 hover:scale-105 group cursor-default"
        style={{
          left: `${centerX - 54}px`,
          top: `${centerY - 48}px`,
          width: '108px',
          height: '96px',
        }}
      >
        {/* Soft Halo breathing pulse */}
        <div className="absolute inset-0 rounded-3xl bg-cyan-400/20 dark:bg-cyan-500/30 blur-xl landing-pulse-halo -z-10" />

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-indigo-600 text-white font-black shadow-md shadow-cyan-500/30 mb-1.5 transition-transform duration-300 group-hover:scale-110">
          <Lightbulb className="h-5 w-5 fill-white text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
        </div>
        <span className="text-[10.5px] font-black tracking-wider text-slate-900 dark:text-cyan-200 uppercase text-center leading-none">
          {t('landing.networkCentral') || 'IDÉE'}
        </span>
        <span className="text-[9px] font-semibold text-cyan-600 dark:text-cyan-400 mt-0.5 tracking-tight">
          من فكرة لفريق
        </span>
      </div>

      {/* Satellite Skill & Team Nodes */}
      {nodes.map((node) => {
        const Icon = node.icon;
        const isHovered = activeNode === node.id;
        const isDimmed = activeNode !== null && !isHovered;

        return (
          <div
            key={node.id}
            onMouseEnter={() => setActiveNode(node.id)}
            onMouseLeave={() => setActiveNode(null)}
            className={`absolute z-20 flex flex-col items-center p-2.5 sm:p-3 rounded-2xl ${node.bg} ${node.border} border backdrop-blur-xl shadow-md dark:shadow-xl transition-all duration-300 cursor-pointer ${
              node.floatClass
            } ${isHovered ? 'scale-110 z-30 ring-2 ring-cyan-400/40 shadow-xl' : isDimmed ? 'opacity-40 scale-95' : 'hover:scale-105'}`}
            style={{
              left: `${node.x - 56}px`,
              top: `${node.y - 36}px`,
              width: '112px',
              boxShadow: isHovered ? `0 0 30px ${node.glow}` : undefined,
            }}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border ${node.border} ${node.text} mb-1 shadow-xs transition-transform duration-300 ${
                isHovered ? 'scale-110 rotate-6' : ''
              }`}
            >
              <Icon className="h-4 w-4 stroke-[2]" />
            </div>

            <span className={`text-[10.5px] font-extrabold tracking-tight ${node.text} text-center leading-tight`}>
              {node.title}
            </span>

            {/* Micro Tag Pills on Hover */}
            {isHovered && (
              <div className="absolute -bottom-8 flex items-center gap-1 bg-white/95 dark:bg-[#070b16]/95 border border-slate-200 dark:border-white/15 px-2.5 py-1 rounded-full text-[9px] font-semibold text-slate-800 dark:text-slate-200 shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-top-1 duration-200 z-40">
                <Sparkles className="h-2.5 w-2.5 text-cyan-500 animate-pulse" />
                <span>{node.tags.slice(0, 2).join(' • ')}</span>
              </div>
            )}
          </div>
        );
      })}

      {/* Subtle Collaboration Indicator Badge at bottom */}
      <div className="absolute bottom-1 sm:bottom-2 inset-x-0 mx-auto w-fit flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-semibold text-slate-600 dark:text-slate-400 backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
        <span>Synergie active • Co-fondation & Équipe</span>
      </div>
    </div>
  );
}
