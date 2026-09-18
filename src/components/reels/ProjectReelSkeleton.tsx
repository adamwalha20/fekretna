'use client';

import React from 'react';

export function ProjectReelSkeleton() {
  return (
    <div className="relative w-full h-[calc(100vh-5.5rem)] md:h-[calc(100vh-6rem)] max-w-4xl mx-auto flex items-center justify-center p-2 sm:p-4 snap-start shrink-0">
      <div className="relative w-full h-full max-h-[820px] max-w-md md:max-w-xl rounded-3xl overflow-hidden border border-slate-800/80 bg-[#080d1a]/80 shadow-2xl flex flex-col justify-between p-6 backdrop-blur-xl animate-pulse">
        {/* Top badges skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-slate-800/80" />
            <div className="h-6 w-28 rounded-full bg-slate-800/60" />
          </div>
          <div className="h-9 w-9 rounded-2xl bg-slate-800/80" />
        </div>

        {/* Center abstract circle placeholder */}
        <div className="flex flex-col items-center justify-center my-auto">
          <div className="h-24 w-24 rounded-3xl bg-slate-800/60 border border-slate-700/40" />
          <div className="h-5 w-32 rounded-full bg-slate-800/50 mt-4" />
        </div>

        {/* Bottom meta & actions skeleton */}
        <div className="flex items-end justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Owner avatar & name */}
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-slate-800" />
              <div className="space-y-1">
                <div className="h-3.5 w-24 rounded bg-slate-800" />
                <div className="h-2.5 w-16 rounded bg-slate-800/60" />
              </div>
            </div>

            {/* Title */}
            <div className="h-6 w-3/4 rounded-lg bg-slate-800" />

            {/* Subtitle / location */}
            <div className="flex gap-3">
              <div className="h-3 w-20 rounded bg-slate-800/60" />
              <div className="h-3 w-24 rounded bg-slate-800/60" />
            </div>

            {/* Description lines */}
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded bg-slate-800/50" />
              <div className="h-3 w-4/5 rounded bg-slate-800/50" />
            </div>

            {/* Skill tags */}
            <div className="flex gap-1.5 pt-1">
              <div className="h-5 w-14 rounded-md bg-slate-800/70" />
              <div className="h-5 w-16 rounded-md bg-slate-800/70" />
              <div className="h-5 w-14 rounded-md bg-slate-800/70" />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <div className="h-8 w-28 rounded-2xl bg-slate-800" />
              <div className="h-8 w-24 rounded-2xl bg-slate-800/70" />
            </div>
          </div>

          {/* Action bar skeleton */}
          <div className="flex flex-col items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-slate-800/80" />
            <div className="h-11 w-11 rounded-2xl bg-slate-800/80" />
            <div className="h-11 w-11 rounded-2xl bg-slate-800/80" />
            <div className="h-11 w-11 rounded-2xl bg-slate-800/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
