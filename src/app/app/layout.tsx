import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { MobileNav } from '@/components/layout/MobileNav';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userEmail = '';
  let userName = 'Membre Fekretna';
  let avatarUrl: string | null = null;
  let unreadNotifications = 0;
  let isAdmin = false;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      userEmail = user.email || '';
      userName = user.user_metadata?.display_name || userEmail.split('@')[0] || 'Membre Fekretna';

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.display_name) {
        userName = profile.display_name;
      }
      if (profile?.avatar_url) {
        avatarUrl = profile.avatar_url;
      }

      // Check unread notifications
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null);

      if (count) {
        unreadNotifications = count;
      }

      // Check admin status
      const { data: adminCheck } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (adminCheck) {
        isAdmin = true;
      }
    }
  } catch {
    // If Supabase not yet connected or session error, use default values
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-slate-100 relative selection:bg-cyan-500/30 selection:text-cyan-800 dark:selection:text-cyan-200">
      {/* Ambient background glow accents */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <AppNavbar
        userEmail={userEmail}
        userName={userName}
        avatarUrl={avatarUrl}
        unreadNotifications={unreadNotifications}
        isAdmin={isAdmin}
      />

      <div className="flex flex-1">
        <AppSidebar isAdmin={isAdmin} />
        <main className="flex-1 pb-24 md:pb-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
