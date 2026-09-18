'use client';

import React, { useState } from 'react';
import { Sparkles, Cpu, Palette, Briefcase, TrendingUp, Lightbulb } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export function NetworkVisual() {
  const { t } = useI18n();
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const nodes = [
    {
      id: 'dev',
      title: t('landing.networkDev'),
      icon: Cpu,
      color: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.4)',
      bg: 'bg-cyan-50 dark:bg-cyan-950/60',
      border: 'border-cyan-300 dark:border-cyan-500/50',
      text: 'text-cyan-800 dark:text-cyan-400',
      iconBg: 'bg-cyan-100 dark:bg-slate-900',
      x: 70,
      y: 90,
      tags: ['React', 'Python', 'AI/ML', 'Mobile'],
    },
    {
      id: 'design',
      title: t('landing.networkDesign'),
      icon: Palette,
      color: '#c084fc',
      glow: 'rgba(192, 132, 252, 0.4)',
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      border: 'border-purple-300 dark:border-purple-500/50',
      text: 'text-purple-800 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-slate-900',
      x: 350,
      y: 80,
      tags: ['UI/UX', 'Figma', 'Prototyping'],
    },
    {
      id: 'business',
      title: t('landing.networkBusiness'),
      icon: Briefcase,
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.4)',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      border: 'border-emerald-300 dark:border-emerald-500/50',
      text: 'text-emerald-800 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-slate-900',
      x: 80,
      y: 330,
      tags: ['Stratégie', 'Finance', 'Pitch'],
    },
    {
      id: 'marketing',
      title: t('landing.networkMarketing'),
      icon: TrendingUp,
      color: '#3b82f6',
      glow: 'rgba(59, 130, 246, 0.4)',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      border: 'border-blue-300 dark:border-blue-500/50',
      text: 'text-blue-800 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-slate-900',
      x: 340,
      y: 320,
      tags: ['Growth', 'Acquisition', 'SEO'],
    },
  ];

  const centerX = 210;
  const centerY = 205;

  return (
    <div className="relative mx-auto w-full max-w-lg aspect-square select-none flex items-center justify-center p-4">
      {/* Ambient background glow behind network */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-blue-500/10 blur-3xl -z-10" />

      {/* SVG Connecting Lines & Pulsing Signals */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 420 410"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lineGradCyan" x1="70" y1="90" x2="210" y2="205" gradientUnits="userSpaceOnUse">
            <stop stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="1" stopColor="#06b6d4" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="lineGradPurple" x1="350" y1="80" x2="210" y2="205" gradientUnits="userSpaceOnUse">
            <stop stopColor="#c084fc" stopOpacity="0.8" />
            <stop offset="1" stopColor="#c084fc" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="lineGradEmerald" x1="80" y1="330" x2="210" y2="205" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="1" stopColor="#10b981" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="lineGradBlue" x1="340" y1="320" x2="210" y2="205" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="1" stopColor="#3b82f6" stopOpacity="0.2" />
          </linearGradient>

          {/* Glowing filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Orbit Rings */}
        <circle cx={centerX} cy={centerY} r="135" stroke="rgba(148, 163, 184, 0.08)" strokeDasharray="4 6" />
        <circle cx={centerX} cy={centerY} r="90" stroke="rgba(6, 182, 212, 0.12)" strokeDasharray="3 4" />

        {/* Dynamic Connector lines */}
        {nodes.map((node) => {
          const isActive = activeNode === node.id || activeNode === null;
          return (
            <g key={node.id}>
              <line
                x1={node.x}
                y1={node.y}
                x2={centerX}
                y2={centerY}
                stroke={node.color}
                strokeOpacity={isActive ? 0.5 : 0.15}
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={activeNode === node.id ? 'none' : '4 4'}
                filter={activeNode === node.id ? 'url(#glow)' : undefined}
                className="transition-all duration-300"
              />

              {/* Animated Light Pulse traveling on line */}
              <circle r="3" fill={node.color} opacity={isActive ? 0.9 : 0.4}>
                <animateMotion
                  path={`M ${node.x} ${node.y} L ${centerX} ${centerY}`}
                  dur={`${3 + (node.x % 3)}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}
      </svg>

      {/* Central Node: IDEA */}
      <div
        className="absolute z-20 flex flex-col items-center justify-center p-4 rounded-3xl bg-white dark:bg-slate-900/90 border-2 border-cyan-500 dark:border-cyan-400 shadow-xl dark:shadow-2xl shadow-cyan-500/20 dark:shadow-cyan-500/40 backdrop-blur-xl transition-all duration-300 hover:scale-105"
        style={{ left: `${centerX - 52}px`, top: `${centerY - 45}px`, width: '104px', height: '90px' }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-black shadow-md shadow-cyan-500/30 mb-1 animate-pulse">
          <Lightbulb className="h-5 w-5 fill-white text-white" />
        </div>
        <span className="text-[11px] font-black tracking-widest text-cyan-800 dark:text-cyan-300 uppercase">
          {t('landing.networkCentral')}
        </span>
      </div>

      {/* Satellite Nodes */}
      {nodes.map((node) => {
        const Icon = node.icon;
        const isHovered = activeNode === node.id;

        return (
          <div
            key={node.id}
            onMouseEnter={() => setActiveNode(node.id)}
            onMouseLeave={() => setActiveNode(null)}
            className={`absolute z-20 flex flex-col items-center p-2.5 rounded-2xl ${node.bg} ${node.border} border backdrop-blur-md shadow-sm dark:shadow-xl transition-all duration-300 cursor-pointer ${
              isHovered ? 'scale-110 shadow-lg dark:shadow-2xl z-30' : 'hover:scale-105'
            }`}
            style={{
              left: `${node.x - 55}px`,
              top: `${node.y - 35}px`,
              width: '110px',
              boxShadow: isHovered ? `0 0 25px ${node.glow}` : undefined,
            }}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-900 border ${node.border} ${node.text} mb-1 shadow-xs`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <span className={`text-[10px] font-extrabold tracking-tight ${node.text} text-center leading-tight`}>
              {node.title}
            </span>

            {/* Hover preview pills */}
            {isHovered && (
              <div className="absolute -bottom-7 flex items-center gap-1 bg-white dark:bg-slate-950/90 border border-slate-300 dark:border-slate-700/80 px-2 py-0.5 rounded-full text-[9px] text-slate-800 dark:text-slate-300 shadow-md whitespace-nowrap animate-in fade-in duration-200">
                <Sparkles className="h-2.5 w-2.5 text-cyan-600 dark:text-cyan-400" />
                <span>{node.tags[0]}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
