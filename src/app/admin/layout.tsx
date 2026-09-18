import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Shield, Users, FolderGit2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  // Check admin role securely in database
  const { data: roleRecord } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();

  // If no admin record exists, redirect unauthorized users
  if (!roleRecord) {
    redirect('/app/discover');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070a13] text-white">
      {/* Admin Top Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md text-white px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold shadow-md shadow-amber-500/10">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              Fekretna Admin
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold uppercase tracking-wider">
                Shield
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Modération & Sécurité</p>
          </div>
        </div>

        <Link
          href="/app/discover"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl-flip" />
          Retour à l&apos;application
        </Link>
      </header>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-60 bg-slate-950/60 border-r border-slate-800/80 p-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
          >
            <Shield className="h-4 w-4 text-amber-400" />
            Tableau de bord
          </Link>
          <Link
            href="/admin/reports"
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
          >
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            Signalements
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
          >
            <Users className="h-4 w-4 text-cyan-400" />
            Utilisateurs
          </Link>
          <Link
            href="/admin/projects"
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
          >
            <FolderGit2 className="h-4 w-4 text-blue-400" />
            Projets
          </Link>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl">
          {children}
        </main>
      </div>
    </div>
  );
}
