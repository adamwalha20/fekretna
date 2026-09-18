'use client';

import React from 'react';

interface FekretnaLogoProps {
  className?: string;
  size?: number | string;
  withGlow?: boolean;
}

export function FekretnaLogo({
  className = 'h-8 w-8',
  size,
  withGlow = false,
}: FekretnaLogoProps) {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={style}>
      {withGlow && (
        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-cyan-500/30 via-teal-400/20 to-amber-500/30 blur-md pointer-events-none -z-10 animate-pulse" />
      )}
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm select-none"
      >
        <defs>
          {/* Cyan/Teal Gradient for Conversation/Tech */}
          <linearGradient id="fekretnaCyan" x1="50" y1="130" x2="330" y2="340" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Amber/Orange Gradient for Idea/Creativity */}
          <linearGradient id="fekretnaOrange" x1="450" y1="130" x2="170" y2="340" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="60%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          {/* Filament Cyan Glow */}
          <linearGradient id="fekretnaFilament" x1="220" y1="200" x2="280" y2="380" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* 1. Left Speech Bubble + Right Bulb Profile */}
        <path
          d="M 285 325 
             C 328 275, 328 190, 250 135 
             C 178 135, 120 145, 95 195 
             C 65 255, 75 305, 125 330 
             L 88 348 
             L 148 335 
             C 175 335, 195 325, 215 325"
          stroke="url(#fekretnaCyan)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {/* 2. Right Speech Bubble + Left Bulb Profile */}
        <path
          d="M 215 325 
             C 172 275, 172 190, 250 135 
             C 322 135, 380 145, 405 195 
             C 435 255, 425 305, 375 330 
             L 412 348 
             L 352 335 
             C 325 335, 305 325, 285 325"
          stroke="url(#fekretnaOrange)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {/* 3. Central Bulb Filament (Infinity / Eyeglasses Loops) */}
        <g stroke="url(#fekretnaFilament)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
          {/* Vertical Leads */}
          <line x1="236" y1="238" x2="236" y2="325" />
          <line x1="264" y1="238" x2="264" y2="325" />

          {/* Left Loop */}
          <path d="M 236 238 C 236 215, 210 215, 210 230 C 210 245, 236 245, 250 245" />

          {/* Right Loop */}
          <path d="M 264 238 C 264 215, 290 215, 290 230 C 290 245, 264 245, 250 245" />
        </g>

        {/* 4. Bulb Screw Base */}
        <g stroke="url(#fekretnaFilament)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
          {/* Top Thread */}
          <line x1="215" y1="344" x2="285" y2="344" />
          {/* Middle Thread */}
          <line x1="222" y1="362" x2="278" y2="362" />
          {/* Bottom Cap */}
          <line x1="234" y1="380" x2="266" y2="380" strokeWidth="14" />
        </g>
      </svg>
    </div>
  );
}
